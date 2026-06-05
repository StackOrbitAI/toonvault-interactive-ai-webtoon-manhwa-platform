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
    const { topic, prompt, images, category, genre, status } = req.body;
    const finalCategory = category || genre;
    const finalTopic = topic || prompt?.slice(0, 40) || "Late Night Train Romance";
    
    try {
        let systemPrompt = "";
        let userPrompt = "";

        if (finalCategory === "Quotes") {
            systemPrompt = "You are a world-class creator of aesthetic wisdom. Your output MUST be a JSON object with: title, description, and an array 'panels' (length 5). Each panel must have 'text' (a profound quote) and 'imagePrompt' (unique, minimalist cinematic photography for Flux, each with a different setting).";
            userPrompt = `Curate a masterpiece collection of 5 deep, aesthetic quotes focused on: "${finalTopic}". Theme details: ${prompt || 'Universal wisdom'}. Ensure the quotes are unique and impactful.`;
        } else if (finalCategory?.toLowerCase() === "romance") {
            systemPrompt = "You are a master of emotional, fluttering slice-of-life Romance Manhwa (webtoon) writing, similar to 'My Bias Gets on the Last Train'. Your output MUST be a JSON object with: title, description, and an array 'panels' (length 10). Write for a seamless vertical scroll format. Every panel must contain: 'speaker' (either 'Narration' for profound, poetic, aesthetic quotes that set the romantic mood, or a character's name like 'Mira' or 'Arin' for short, emotional, punchy dialogue), 'text' (the dialogue or poetic quote - ensure it is extremely professional, deep, and heartwarming), and 'imagePrompt' (a unique, extremely detailed visual description for the FLUX model focusing on high-fidelity, dreamlike anime/manhwa art styles, romantic cinematic lighting like teal & rose late-night glow, rainy train station, soft reflections, golden dawn, clean linework, and safe-for-work content. Make each composition distinct like establishing wide shots, intimate close-ups, over-the-shoulder perspectives to ensure a professional webtoon flow without visual repetition).";
            userPrompt = `Draft a fluttering, heartwarming 10-panel late-night Romance Webtoon pilot episode about: "${finalTopic}". Theme details and plot hooks: ${prompt || 'A fateful commute meeting under rainy lights'}. Focus on cinematic visual storytelling, soft romantic tension, deep quotes, and relatable character dynamics.`;
        } else {
            systemPrompt = "You are an elite Manhwa (webtoon) writer. Your output MUST be a JSON object with: title, description, and an array 'panels' (length 10). CRITICAL: Write for a seamless vertical scroll format. Use very short, punchy dialogue. Every panel must have a unique, distinct 'imagePrompt' (establishing shots, extreme close-ups, dynamic action) to ensure a professional Webtoon flow. Avoid visual repetition.";
            userPrompt = `Draft a high-stakes, professionally structured 10-panel Webtoon/Manhwa pilot episode about: "${finalTopic}". Tone: Dramatic, High-Fantasy, Epic. Plot hooks: ${prompt || 'A fateful encounter'}. Focus on cinematic visual storytelling, fast pacing, and emotional tension.`;
        }

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
                    model: "runware:100@1", // Always use best model
                    positivePrompt: finalCategory === "Quotes" 
                        ? `masterpiece, minimalist aesthetic, cinematic photography, high contrast, moody lighting, elegant atmosphere, ultra-detailed, ${p.imagePrompt}`
                        : `masterpiece, ultra-detailed Korean manhwa webtoon style, beautiful anime aesthetic, official webtoon style, dynamic composition, dramatic cinematic lighting, highly detailed character design, clean linework, vibrant colors, ${p.imagePrompt}`,
                    negativePrompt: "blurry, low quality, ugly, bad anatomy, extra limbs, watermark, text overlay, logo, nsfw, bad proportions",
                    width: 512,
                    height: 768,
                    numberResults: 1,
                    outputFormat: "WEBP",
                    seed: Math.floor(Math.random() * 2147483647),
                    CFGScale: 7,
                    steps: 28
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
                const cleanPrompt = finalCategory === "Quotes"
                    ? `masterpiece, minimalist aesthetic, cinematic photography, high contrast, clean, elegant, ${p.imagePrompt}`
                    : `masterpiece, highly detailed Manhwa style, beautiful anime aesthetic, cinematic lighting, intricate textures, 8k resolution, ${p.imagePrompt}`;
                const seed = Math.floor(Math.random() * 1000000);
                return `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=512&height=768&nologo=true&seed=${seed}`;
            });
        }

        const isMature = finalCategory?.toLowerCase() === 'mature' || (req.body.status === 'published' && finalCategory?.toLowerCase() === 'mature');
        
        // Build enriched content array with text+speaker for reader overlay
        const enrichedContent = storyPanels.map((p, i) => ({
            speaker: p.speaker || 'Narration',
            text: p.text || '',
            imageUrl: imageUrls[i] || ''
        }));
        
        const newStory = new Story({
            title: title || finalTopic || "Untitled Story",
            genre: finalCategory || "Fantasy",
            authorId: req.user.id,
            authorName: req.user.username || "Creator",
            status: status === 'published' ? 'Live' : 'Draft',
            type: 'Comic',
            description: description,
            isAgeRestricted: isMature,
            content: JSON.stringify(enrichedContent), // enriched with speaker + text for overlay
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

        // Continuity Context: Feed previous dialogues & panels to maintain strict narrative alignment
        let previousEpisodesContext = "";
        if (story.episodes && story.episodes.length > 0) {
            previousEpisodesContext = story.episodes.map(ep => {
                let panelsText = "";
                try {
                    const parsed = JSON.parse(ep.content);
                    if (Array.isArray(parsed)) {
                        panelsText = parsed.map(p => `${p.speaker}: "${p.text}"`).join('\n');
                    } else {
                        panelsText = ep.content;
                    }
                } catch (e) {
                    panelsText = ep.content || "";
                }
                return `--- Episode ${ep.number}: ${ep.title} ---\n${panelsText}`;
            }).join('\n\n');
        } else {
            try {
                const parsed = JSON.parse(story.content);
                if (Array.isArray(parsed)) {
                    previousEpisodesContext = `--- Episode 1 ---\n` + parsed.map(p => `${p.speaker}: "${p.text}"`).join('\n');
                }
            } catch (e) {}
        }

        const context = `This is the next episode of the story "${story.title}". 
        Summary: ${story.description}. 
        
        Previous Episodes History:
        ${previousEpisodesContext}
        
        User wants this to happen in the next episode: ${userPrompt || "Continue the plot naturally."}
        
        CRITICAL: Maintain strict continuity with character names, their speech style, and plot details from the history listed above.`;

        // 1. Generate next episode content with Mistral
        const mistralResp = await axios.post('https://api.mistral.ai/v1/chat/completions', {
            model: "mistral-small-latest",
            messages: [{
                role: "system",
                content: "You are a professional Manhwa scriptwriter specializing in high-tension drama and fantasy. Your task is to write the NEXT episode of an existing series. Ensure narrative continuity, character development, and emotional impact. Output ONLY a JSON object with: episodeTitle, and an array 'panels' (length 10) where each item has 'text' (short punchy dialogue) and 'imagePrompt' (detailed cinematic description). CRITICAL: Write for a seamless vertical scroll format. Every panel must have a unique, distinct 'imagePrompt' that varies in composition."
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
                    model: "runware:100@1",
                    positivePrompt: `score_9, score_8_up, masterpiece, best quality, beautiful manhwa webtoon art, official webtoon style, dynamic composition, dramatic cinematic lighting, highly detailed character design, clean linework, ${p.imagePrompt}`,
                    width: 512,
                    height: 768,
                    numberResults: 1,
                    outputFormat: "JPG",
                    seed: Math.floor(Math.random() * 2147483647),
                    CFGScale: 3.5,
                    steps: 6
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

        const episodeNumber = story.episodes && story.episodes.length > 0 
            ? (Math.max(...story.episodes.map(e => e.number || 0)) + 1) 
            : 2; 
        
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
