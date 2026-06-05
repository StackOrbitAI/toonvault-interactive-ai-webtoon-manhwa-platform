const mongoose = require('mongoose');
const axios = require('axios');
const crypto = require('crypto');

const MISTRAL_KEY = process.env.MISTRAL_API_KEY || "YOUR_MISTRAL_API_KEY";
const RUNWARE_KEY = process.env.RUNWARE_API_KEY || "YOUR_RUNWARE_API_KEY";
const MONGO_URI = 'mongodb://mongo:27017/toonvault';

const Story = require('./models/Story');

async function generate() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");

        const topic = "Star-Crossed Shadows: The Rebel's Heart";
        const prompt = "A high-stakes Sci-Fi Romance Manhwa. Intense visual variety between panels: wide shots of a futuristic city, close-ups of emotional faces, dynamic action poses. Each panel must be visually distinct and unique.";

        console.log(`\nGenerating Full Episode: ${topic}`);
        
        // 1. Mistral
        const mistralResp = await axios.post('https://api.mistral.ai/v1/chat/completions', {
            model: "mistral-small-latest",
            messages: [{
                role: "system",
                content: "You are a professional Manhwa (webtoon) writer. Output ONLY a JSON object with: title, description, and an array 'panels' (length 10). CRITICAL: Every panel must have a unique, distinct 'imagePrompt' that varies in composition (close-up, wide-shot, side-profile, etc.) to ensure a dynamic reading experience. Each item has 'text' and 'imagePrompt'."
            }, {
                role: "user",
                content: `Create a 10-panel pilot episode for: ${topic}. Context: ${prompt}. Ensure every single panel has a unique visual setting or angle.`
            }],
            response_format: { type: "json_object" }
        }, { headers: { 'Authorization': `Bearer ${MISTRAL_KEY}` } });

        const aiOutput = JSON.parse(mistralResp.data.choices[0].message.content);
        const { title, description, panels: storyPanels } = aiOutput;

        // 2. Runware
        const runwareTasks = [
            { taskType: "authentication", apiKey: RUNWARE_KEY },
            ...storyPanels.map((p) => ({
                taskType: "imageInference",
                taskUUID: crypto.randomUUID(),
                model: "runware:100@1", // Flux Schnell
                positivePrompt: `masterpiece, highly detailed Manhwa art style, beautiful sexy anime aesthetic, cinematic lighting, 8k, Intricate details, sensual atmosphere, ${p.imagePrompt}`,
                width: 512,
                height: 768,
                numberResults: 1,
                outputFormat: "JPG",
                CFGScale: 3.5,
                steps: 4
            }))
        ];

        const runwareResp = await axios.post('https://api.runware.ai/v1', runwareTasks, {
            headers: { 'Content-Type': 'application/json' }
        });

        const imageUrls = runwareResp.data.data
            .filter(d => d.taskType === "imageInference")
            .map(d => d.imageURL);

        const newStory = new Story({
            title: title || topic,
            genre: "Mature Romance",
            authorId: "69e7a4cbbd3f6e75334d5f2d",
            authorName: "admin",
            status: 'Live',
            type: 'Comic',
            description: description,
            content: JSON.stringify(storyPanels),
            panels: imageUrls,
            coverIcon: "🫦",
            views: 85000,
            likes: 12400,
            rating: 5.0
        });

        await newStory.save();
        console.log("✅ FULL EPISODE GENERATED: " + newStory._id);
        process.exit(0);
    } catch (err) {
        console.error(err.response?.data || err.message);
        process.exit(1);
    }
}

generate();
