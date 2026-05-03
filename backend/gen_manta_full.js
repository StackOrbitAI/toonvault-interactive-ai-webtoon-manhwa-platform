const mongoose = require('mongoose');
const axios = require('axios');
const crypto = require('crypto');

const MISTRAL_KEY = "VztpyOHj6iS6uF8FKNRvLLxFeG3oS3RR";
const RUNWARE_KEY = "qHl8dL3BSobrD7j52dc2aTMK4E1lRQTy";
const MONGO_URI = 'mongodb://mongo:27017/toonvault';

const Story = require('./models/Story');

async function generate() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");

        const topic = "Forbidden Night: The Duke’s Secret Passion";
        const prompt = "A highly mature and sexy Manhwa style story. Beautiful female protagonist in a revealing gala dress, intense tension with a tall muscular Duke. High-end lighting, detailed eyes and lips, cinematic atmosphere.";

        console.log(`\nGenerating Full Episode: ${topic}`);
        
        // 1. Mistral
        const mistralResp = await axios.post('https://api.mistral.ai/v1/chat/completions', {
            model: "mistral-small-latest",
            messages: [{
                role: "system",
                content: "You are a professional Manhwa (webtoon) writer specializing in mature, sexy romance. Output ONLY a JSON object with: title, description, and an array 'panels' (length 10) where each item has 'text' (intense dialogue or narration) and 'imagePrompt' (Masterpiece, Manhwa style, detailed, sexy aesthetic, [subject description])."
            }, {
                role: "user",
                content: `Create a 10-panel sexy Manhwa episode about: ${topic}. Context: ${prompt}`
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
