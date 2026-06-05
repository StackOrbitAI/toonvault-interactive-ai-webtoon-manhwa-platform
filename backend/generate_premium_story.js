const mongoose = require('mongoose');
const axios = require('axios');
const Story = require('./models/Story');
const User = require('./models/User');
const crypto = require('crypto');

const MISTRAL_KEY = process.env.MISTRAL_API_KEY || "YOUR_MISTRAL_API_KEY";
const RUNWARE_KEY = process.env.RUNWARE_API_KEY || "YOUR_RUNWARE_API_KEY";
const MONGO_URI = 'mongodb://mongo:27017/toonvault';

async function generatePremiumStory() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB...");

        const admin = await User.findOne({ role: 'admin' }) || await User.findOne();
        if (!admin) throw new Error("No user found to assign as author.");

        console.log("🎨 Designing: Chronicles of the Ethereal Painter...");

        // 1. Generate Narrative with Mistral
        const narrativeResp = await axios.post('https://api.mistral.ai/v1/chat/completions', {
            model: "mistral-small-latest",
            messages: [{
                role: "system",
                content: `You are a world-class manhwa writer. Design a professional interactive story titled 'Chronicles of the Ethereal Painter'.
                The story is about Lyra, a girl who can paint reality. 
                Output a JSON object with:
                - description: A deep, poetic summary.
                - nodes: An array of 6 story nodes. Each node must have:
                    - id: 'n1' to 'n6'
                    - label: 'Prologue', 'Branch A', etc.
                    - title: Scene title
                    - description: Poetic quote or narration for the scene.
                    - imagePrompt: Detailed visual prompt for FLUX model (cinema style, high contrast, anime aesthetic).
                    - isPopular: boolean
                    - isAgeRestricted: boolean
                    - x/y: map coordinates (e.g., 0,0 then branching).
                `
            }],
            response_format: { type: "json_object" }
        }, { headers: { 'Authorization': `Bearer ${MISTRAL_KEY}` } });

        const { description, nodes: storyNodes } = JSON.parse(narrativeResp.data.choices[0].message.content);

        // 2. Generate Images with Runware
        console.log("✨ Generating cinematic visuals with Runware...");
        const runwareTasks = [
            { taskType: "authentication", apiKey: RUNWARE_KEY },
            ...storyNodes.map((node) => ({
                taskType: "imageInference",
                taskUUID: crypto.randomUUID(),
                model: "runware:100@1",
                positivePrompt: `masterpiece, best quality, cinematic lighting, beautiful manhwa art style, highly detailed, vibrant colors, ${node.imagePrompt}`,
                width: 512,
                height: 768,
                numberResults: 1,
                outputFormat: "JPG",
                CFGScale: 3.5,
                steps: 6
            }))
        ];

        const runwareResp = await axios.post('https://api.runware.ai/v1', runwareTasks, { timeout: 120000 });
        const imageUrls = runwareResp.data.data
            .filter(d => d.taskType === "imageInference")
            .map(d => d.imageURL);

        // Map images back to nodes
        const finalNodes = storyNodes.map((node, i) => ({
            ...node,
            panels: [imageUrls[i]],
            status: i === 0 ? 'unlocked' : 'locked',
            authorId: admin._id,
            authorName: admin.username,
            type: 'scene'
        }));

        const newStory = new Story({
            title: "Chronicles of the Ethereal Painter",
            genre: "Fantasy",
            authorId: admin._id,
            authorName: admin.username,
            status: 'Live',
            type: 'Comic',
            description: description,
            coverIcon: "🎨",
            views: 45000,
            likes: 12400,
            rating: 5.0,
            isPopular: true,
            panels: [imageUrls[0]], // First image as cover
            nodes: finalNodes
        });

        await newStory.save();
        console.log("✅ Premium Story Created: " + newStory.title);
        console.log("Story ID:", newStory._id);

        process.exit(0);
    } catch (err) {
        console.error("Generation Error:", err.response?.data || err.message);
        process.exit(1);
    }
}

generatePremiumStory();
