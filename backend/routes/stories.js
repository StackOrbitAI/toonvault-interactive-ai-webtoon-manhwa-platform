const express = require('express');
const router = express.Router();
const axios = require('axios');
const Story = require('../models/Story');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const redis = require('../redisClient');

// Get all stories
router.get('/', async (req, res) => {
    try {
        const stories = await Story.find().sort({ views: -1 });
        res.json(stories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update story status (Approve/Reject)
router.patch('/:id/status', auth, adminOnly, async (req, res) => {
    try {
        const story = await Story.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json(story);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Like a story
router.post('/:id/like', auth, async (req, res) => {
    try {
        const storyId = req.params.id;
        const userId = req.user.id;
        
        // Prevent duplicate likes
        const hasLiked = await redis.sismember(`story:${storyId}:likes_set`, userId);
        if (hasLiked) {
            return res.status(400).json({ message: 'Already liked this story' });
        }

        // Check if disliked previously, if so, remove dislike
        const hasDisliked = await redis.sismember(`story:${storyId}:dislikes_set`, userId);
        if (hasDisliked) {
            await redis.srem(`story:${storyId}:dislikes_set`, userId);
            await redis.decr(`story:${storyId}:dislikes`);
        }

        // Add like
        await redis.sadd(`story:${storyId}:likes_set`, userId);
        const newLikes = await redis.incr(`story:${storyId}:likes`);
        
        // Update ranking score (+1)
        await redis.zincrby('story_ranking', 1, storyId);
        
        // Sync to MongoDB async
        Story.findByIdAndUpdate(storyId, { $inc: { likes: 1 } }).exec();

        res.json({ message: 'Story liked', likes: newLikes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Dislike a story
router.post('/:id/dislike', auth, async (req, res) => {
    try {
        const storyId = req.params.id;
        const userId = req.user.id;
        
        // Prevent duplicate dislikes
        const hasDisliked = await redis.sismember(`story:${storyId}:dislikes_set`, userId);
        if (hasDisliked) {
            return res.status(400).json({ message: 'Already disliked this story' });
        }

        // Check if liked previously, if so, remove like
        const hasLiked = await redis.sismember(`story:${storyId}:likes_set`, userId);
        if (hasLiked) {
            await redis.srem(`story:${storyId}:likes_set`, userId);
            await redis.decr(`story:${storyId}:likes`);
            // Remove +1 from ranking
            await redis.zincrby('story_ranking', -1, storyId);
        }

        // Add dislike
        await redis.sadd(`story:${storyId}:dislikes_set`, userId);
        const newDislikes = await redis.incr(`story:${storyId}:dislikes`);
        
        // Update ranking score (-1)
        await redis.zincrby('story_ranking', -1, storyId);
        
        // Sync to MongoDB async
        Story.findByIdAndUpdate(storyId, { $inc: { dislikes: 1 } }).exec();

        res.json({ message: 'Story disliked', dislikes: newDislikes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Live Ranking
router.get('/live/ranking', async (req, res) => {
    try {
        // Fetch top 10 stories by rank score
        const topStoriesIds = await redis.zrevrange('story_ranking', 0, 9, 'WITHSCORES');
        const ranking = [];
        
        for (let i = 0; i < topStoriesIds.length; i += 2) {
            const storyId = topStoriesIds[i];
            const score = topStoriesIds[i+1];
            // Get likes & dislikes from Redis
            const likes = await redis.get(`story:${storyId}:likes`) || 0;
            const dislikes = await redis.get(`story:${storyId}:dislikes`) || 0;
            
            // Try fetching story details from MongoDB to enrich response
            const storyDetails = await Story.findById(storyId).select('title genre authorName coverIcon');
            
            if (storyDetails) {
                ranking.push({
                    storyId,
                    title: storyDetails.title,
                    genre: storyDetails.genre,
                    author: storyDetails.authorName,
                    cover: storyDetails.coverIcon,
                    score: parseInt(score),
                    likes: parseInt(likes),
                    dislikes: parseInt(dislikes)
                });
            }
        }
        
        res.json(ranking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// AI Generation Route for Stories (Toon Panels)
router.post('/generate', auth, async (req, res) => {
    const { topic, prompt, images, category, status } = req.body;
    
    try {
        // 1. Generate Narrative & Prompts using Mistral
        const mistralResp = await axios.post('https://api.mistral.ai/v1/chat/completions', {
            model: "mistral-small-latest",
            messages: [{
                role: "system",
                content: "You are a webtoon story writer. Output ONLY a JSON object with: title, description, and an array 'panels' (length 5) where each item has 'text' (dialogue/narration) and 'imagePrompt' (detailed visual description for Flux AI)."
            }, {
                role: "user",
                content: `Create a Manta-style webtoon story about: ${topic}. ${prompt ? `Context: ${prompt}` : ''}`
            }],
            response_format: { type: "json_object" }
        }, { headers: { 'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}` } });

        const aiOutput = JSON.parse(mistralResp.data.choices[0].message.content);
        const { title, description, panels: storyPanels } = aiOutput;

        // 2. Generate Images using Runware (FLUX.1 [schnell])
        const runwareTasks = storyPanels.map((p, idx) => ({
            taskType: "imageInference",
            taskUUID: `panel-${idx}-${Date.now()}`,
            model: process.env.RUNWARE_MODEL || "runware:31@1", // Flux Schnell
            positivePrompt: `manga style, webtoon aesthetic, high quality, colorful, ${p.imagePrompt}`,
            width: 512,
            height: 768,
            numberResults: 1,
            outputFormat: "JPG",
            CFGScale: 3.5,
            steps: 4
        }));

        const runwareResp = await axios.post('https://api.runware.ai/v1', runwareTasks, {
            headers: { 'Content-Type': 'application/json' }
        });

        // Runware returns a list of results for each task
        const imageUrls = runwareResp.data.data
            .filter(d => d.taskType === "imageInference")
            .map(d => d.imageURL);

        const newStory = new Story({
            title: title || topic || "Untitled Story",
            genre: category || "Fantasy",
            authorId: req.user.id,
            authorName: req.user.username || "Creator",
            status: status === 'published' ? 'Live' : 'Draft',
            type: 'Comic',
            description: description,
            content: JSON.stringify(storyPanels), // Store the dialogue too
            panels: imageUrls,
            coverIcon: "✨"
        });

        await newStory.save();
        res.json({ message: "Story generated successfully!", story: newStory });
    } catch (err) {
        console.error("AI Generation Error:", err.response?.data || err.message);
        res.status(500).json({ error: "Failed to generate story with AI. " + (err.response?.data?.message || err.message) });
    }
});

// AI Generation Route for Articles
router.post('/generate-article', auth, async (req, res) => {
    const { topic, tone, genre, length } = req.body;
    
    try {
        const mistralResp = await axios.post('https://api.mistral.ai/v1/chat/completions', {
            model: "mistral-small-latest",
            messages: [{
                role: "user",
                content: `Write a ${tone} ${genre} article about "${topic}". Length: ${length}.`
            }]
        }, { headers: { 'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}` } });

        const content = mistralResp.data.choices[0].message.content;

        const newArticle = new Story({
            title: topic || "AI Article",
            genre: genre,
            authorId: req.user.id,
            authorName: req.user.username || "Writer",
            status: 'Live',
            type: 'Article',
            content: content,
            description: `A ${tone} piece about ${topic}`,
            coverIcon: "✍️"
        });

        await newArticle.save();
        res.json({ message: "Article generated successfully!", article: newArticle });
    } catch (err) {
        console.error("AI Article Error:", err.response?.data || err.message);
        res.status(500).json({ error: "Failed to generate article with AI" });
    }
});

module.exports = router;
