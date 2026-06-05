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

        const topic = "Timeless Echoes: From First Steps to First Love";
        const prompt = "A nostalgic and romantic story about childhood sweethearts growing up together. Each panel should feature a beautiful quote about love and time. Visuals should transition from childhood innocence to teenage longing to adult devotion. 12 images total.";

        console.log(`\nGenerating Special Episode: ${topic}`);
        
        // 1. Mistral
        const mistralResp = await axios.post('https://api.mistral.ai/v1/chat/completions', {
            model: "mistral-small-latest",
            messages: [{
                role: "system",
                content: "You are a poetic Manhwa writer. Output ONLY a JSON object with: title, description, and an array 'panels' (length 12). Every panel MUST have 'text' (a beautiful, short romantic quote or dialogue) and 'imagePrompt' (Masterpiece, Manhwa style, cinematic lighting, 8k). Ensure a visual progression from childhood (age 5-8) to youth (age 15-18) to adulthood (age 22-25). Every panel must be unique and different."
            }, {
                role: "user",
                content: `Create a 12-panel romantic journey about: ${topic}. Context: ${prompt}. Focus on emotional quotes.`
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
                positivePrompt: `masterpiece, highly detailed Manhwa art style, nostalgic lighting, beautiful anime aesthetic, 8k, emotional atmosphere, ${p.imagePrompt}`,
                width: 512,
                height: 768,
                numberResults: 1,
                outputFormat: "JPG",
                CFGScale: 3.5,
                steps: 4
            }))
        ];

        console.log("Generating 12 images with Flux...");
        const runwareResp = await axios.post('https://api.runware.ai/v1', runwareTasks, {
            headers: { 'Content-Type': 'application/json' }
        });

        const imageUrls = runwareResp.data.data
            .filter(d => d.taskType === "imageInference")
            .map(d => d.imageURL);

        const newStory = new Story({
            title: title || topic,
            genre: "Romance",
            authorId: "69e7a4cbbd3f6e75334d5f2d", // admin
            authorName: "admin",
            status: 'Live',
            type: 'Comic',
            description: description,
            content: JSON.stringify(storyPanels),
            panels: imageUrls,
            coverIcon: "❤️",
            views: 42000,
            likes: 8500,
            rating: 5.0
        });

        await newStory.save();
        console.log("\n✅ SPECIAL EPISODE GENERATED!");
        console.log("ID: " + newStory._id);
        console.log("Link: https://toonvault.com/manta/" + newStory._id);
        process.exit(0);
    } catch (err) {
        console.error(err.response?.data || err.message);
        process.exit(1);
    }
}

generate();
