const express = require('express');
const router = express.Router();
const axios = require('axios');
const Story = require('../models/Story');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const redis = require('../redisClient');
const crypto = require('crypto');

// Get all stories
router.get('/', async (req, res) => {
    try {
        const stories = await Story.find().sort({ views: -1 });
        res.json(stories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific story by ID
router.get('/:id', async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);
        if (!story) return res.status(404).json({ message: 'Story not found' });
        
        // Track view asynchronously
        Story.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();
        
        res.json(story);
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
        const systemPrompt = category === "Quotes" 
            ? "You are a world-class creator of aesthetic wisdom. Your output MUST be a JSON object with: title, description, and an array 'panels' (length 5). Each panel must have 'text' (a profound quote) and 'imagePrompt' (unique, minimalist cinematic photography for Flux, each with a different setting)."
            : "You are an elite Manhwa (webtoon) writer. Your output MUST be a JSON object with: title, description, and an array 'panels' (length 10). CRITICAL: Every panel must have a unique, distinct 'imagePrompt' that varies in composition (wide shots, close-ups, action poses) and environment to ensure a dynamic visual flow. Avoid visual repetition.";

        const userPrompt = category === "Quotes"
            ? `Curate a masterpiece collection of 5 deep, aesthetic quotes focused on: "${topic}". Theme details: ${prompt || 'Universal wisdom'}. Ensure the quotes are unique and impactful.`
            : `Draft a high-stakes, professionally structured 10-panel Manhwa pilot episode about: "${topic}". Tone: Dramatic, High-Fantasy, Epic. Plot hooks: ${prompt || 'A fateful encounter'}. Focus on visual storytelling, dynamic action, and emotional tension.`;

        // 1. Generate Narrative & Prompts using Mistral
        const mistralResp = await axios.post('https://api.mistral.ai/v1/chat/completions', {
            model: "mistral-small-latest",
            messages: [{
                role: "system",
                content: systemPrompt
            }, {
                role: "user",
                content: userPrompt
            }],
            response_format: { type: "json_object" }
        }, { headers: { 'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}` } });

        const aiOutput = JSON.parse(mistralResp.data.choices[0].message.content);
        const { title, description, panels: storyPanels } = aiOutput;

        // 2. Generate Images using Runware (FLUX.1 [schnell]) with robust fallback
        let imageUrls = [];
        try {
            if (!process.env.RUNWARE_API_KEY) {
                throw new Error("No Runware API Key provided in .env");
            }
            const runwareTasks = [
                { taskType: "authentication", apiKey: process.env.RUNWARE_API_KEY },
                ...storyPanels.map((p, idx) => ({
                    taskType: "imageInference",
                    taskUUID: crypto.randomUUID(),
                    model: "civitai:257749@290640", 
                    positivePrompt: category === "Quotes" 
                        ? `masterpiece, minimalist aesthetic, cinematic photography, high contrast, clean, elegant, ${p.imagePrompt}`
                        : `score_9, score_8_up, score_7_up, masterpiece, best quality, beautiful manhwa style, dramatic webtoon aesthetic, rich vibrant colors, safe for work, ${p.imagePrompt}`,
                    width: 512,
                    height: 768,
                    numberResults: 1,
                    outputFormat: "JPG",
                    seed: Math.floor(Math.random() * 2147483647),
                    CFGScale: 7.0,
                    steps: 25
                }))
            ];

            const runwareResp = await axios.post('https://api.runware.ai/v1', runwareTasks, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 60000
            });

            if (runwareResp.data && runwareResp.data.data) {
                imageUrls = runwareResp.data.data
                    .filter(d => d.taskType === "imageInference" && d.imageURL)
                    .map(d => d.imageURL);
            }

            if (imageUrls.length === 0) {
                const errors = runwareResp.data?.errors || [];
                throw new Error("Runware returned no images. Errors: " + JSON.stringify(errors));
            }
            console.log(`🎨 Successfully generated ${imageUrls.length} images using Runware API.`);
        } catch (runwareError) {
            console.warn("⚠️ Runware API call failed. Falling back to high-fidelity AI Image engine (Pollinations AI):", runwareError.message);
            
            // Fallback: Generate Pollinations AI URLs which generate images on-the-fly
            imageUrls = storyPanels.map((p, idx) => {
                const cleanPrompt = category === "Quotes"
                    ? `masterpiece, minimalist aesthetic, cinematic photography, high contrast, clean, elegant, ${p.imagePrompt}`
                    : `masterpiece, highly detailed Manhwa style, beautiful anime aesthetic, cinematic lighting, intricate textures, 8k resolution, ${p.imagePrompt}`;
                const seed = Math.floor(Math.random() * 1000000);
                return `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=512&height=768&nologo=true&seed=${seed}`;
            });
        }

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
        if (err.response) {
            console.error("AI Generation API Error Response:", JSON.stringify(err.response.data, null, 2));
        } else {
            console.error("AI Generation Error (No Response):", err.message);
        }
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

// AI Generation Route for Next Episodes
router.post('/generate-episode', auth, async (req, res) => {
    const { storyId, prompt: userPrompt } = req.body;
    try {
        const story = await Story.findById(storyId);
        if (!story) return res.status(404).json({ error: "Story not found" });

        // Continuity Context
        const context = `This is the next episode of the story "${story.title}". 
        Summary: ${story.description}. 
        User wants this to happen next: ${userPrompt || "Continue the plot naturally."}`;

        // 1. Generate next episode content with Mistral
        const mistralResp = await axios.post('https://api.mistral.ai/v1/chat/completions', {
            model: "mistral-small-latest",
            messages: [{
                role: "system",
                content: "You are a professional Manhwa scriptwriter specializing in high-tension drama and fantasy. Your task is to write the NEXT episode of an existing series. Ensure narrative continuity, character development, and emotional impact. Output ONLY a JSON object with: episodeTitle, and an array 'panels' (length 10) where each item has 'text' (dialogue/narration) and 'imagePrompt' (detailed cinematic description for the artist). CRITICAL: Every panel must have a unique, distinct 'imagePrompt' that varies in composition."
            }, {
                role: "user",
                content: context
            }],
            response_format: { type: "json_object" }
        }, { headers: { 'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}` } });

        const aiOutput = JSON.parse(mistralResp.data.choices[0].message.content);
        const { episodeTitle, panels: storyPanels } = aiOutput;

        // 2. Generate Images with robust fallback
        let imageUrls = [];
        try {
            if (!process.env.RUNWARE_API_KEY) {
                throw new Error("No Runware API Key provided in .env");
            }
            const runwareTasks = [
                { taskType: "authentication", apiKey: process.env.RUNWARE_API_KEY },
                ...storyPanels.map((p, idx) => ({
                    taskType: "imageInference",
                    taskUUID: crypto.randomUUID(),
                    model: "civitai:257749@290640",
                    positivePrompt: `score_9, score_8_up, score_7_up, masterpiece, best quality, beautiful manhwa style, dramatic webtoon aesthetic, rich vibrant colors, safe for work, ${p.imagePrompt}`,
                    width: 512,
                    height: 768,
                    numberResults: 1,
                    outputFormat: "JPG",
                    seed: Math.floor(Math.random() * 2147483647),
                    CFGScale: 7.0,
                    steps: 25
                }))
            ];

            const runwareResp = await axios.post('https://api.runware.ai/v1', runwareTasks, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 60000
            });

            if (runwareResp.data && runwareResp.data.data) {
                imageUrls = runwareResp.data.data
                    .filter(d => d.taskType === "imageInference" && d.imageURL)
                    .map(d => d.imageURL);
            }

            if (imageUrls.length === 0) {
                const errors = runwareResp.data?.errors || [];
                throw new Error("Runware returned no images. Errors: " + JSON.stringify(errors));
            }
            console.log(`🎨 Successfully generated ${imageUrls.length} next episode images using Runware API.`);
        } catch (runwareError) {
            console.warn("⚠️ Runware API call failed for next episode. Falling back to high-fidelity AI Image engine (Pollinations AI):", runwareError.message);
            
            // Fallback: Generate Pollinations AI URLs which generate images on-the-fly
            imageUrls = storyPanels.map((p, idx) => {
                const cleanPrompt = `masterpiece, best quality, ultra-detailed, beautiful manhwa style, dramatic immersive webtoon aesthetic, safe for work, rich vibrant colors, cinematic lighting, ${p.imagePrompt}`;
                const seed = Math.floor(Math.random() * 1000000);
                return `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=512&height=768&nologo=true&seed=${seed}`;
            });
        }

        const episodeNumber = (story.episodes?.length || 0) + 2; 
        
        const newEpisode = {
            number: episodeNumber,
            title: episodeTitle || `Episode ${episodeNumber}`,
            panels: imageUrls,
            content: JSON.stringify(storyPanels)
        };

        story.episodes.push(newEpisode);
        await story.save();

        res.json({ message: "Next episode generated successfully!", episode: newEpisode });
    } catch (err) {
        console.error("Episode Gen Error:", err.message);
        res.status(500).json({ error: "Failed to generate next episode: " + err.message });
    }
});

module.exports = router;
