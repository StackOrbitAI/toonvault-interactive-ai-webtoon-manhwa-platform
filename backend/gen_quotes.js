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

        const topics = [
            "Love and Longing",
            "Motivation and Success",
            "Inner Peace and Stillness"
        ];

        for (const topic of topics) {
            console.log(`\nGenerating Quotes for: ${topic}`);
            
            const mistralResp = await axios.post('https://api.mistral.ai/v1/chat/completions', {
                model: "mistral-small-latest",
                messages: [{
                    role: "system",
                    content: "You are a creator of aesthetic and deep quotes. Output ONLY a JSON object with: title (collection name), description, and an array 'panels' (length 5) where each item has 'text' (a beautiful quote) and 'imagePrompt' (a minimalist, aesthetic background description matching the quote's mood)."
                }, {
                    role: "user",
                    content: `Create a collection of 5 deep aesthetic quotes about: ${topic}.`
                }],
                response_format: { type: "json_object" }
            }, { headers: { 'Authorization': `Bearer ${MISTRAL_KEY}` } });

            const aiOutput = JSON.parse(mistralResp.data.choices[0].message.content);
            const { title, description, panels: storyPanels } = aiOutput;

            const runwareTasks = [
                { taskType: "authentication", apiKey: RUNWARE_KEY },
                ...storyPanels.map((p) => ({
                    taskType: "imageInference",
                    taskUUID: crypto.randomUUID(),
                    model: "runware:100@1",
                    positivePrompt: `masterpiece, minimalist aesthetic, cinematic photography, high contrast, clean, elegant, ${p.imagePrompt}`,
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

            if (runwareResp.data.errors) {
                console.error("RUNWARE ERRORS:", JSON.stringify(runwareResp.data.errors, null, 2));
                continue;
            }

            const imageUrls = runwareResp.data.data
                .filter(d => d.taskType === "imageInference")
                .map(d => d.imageURL);

            const newStory = new Story({
                title: title || topic,
                genre: "Quotes",
                authorId: "69e7a4cbbd3f6e75334d5f2d",
                authorName: "admin",
                status: 'Live',
                type: 'Comic',
                description: description,
                content: JSON.stringify(storyPanels),
                panels: imageUrls,
                coverIcon: "✍️",
                views: Math.floor(Math.random() * 5000),
                likes: Math.floor(Math.random() * 500),
                rating: 4.9
            });

            await newStory.save();
            console.log("✅ GENERATED: " + title);
            await new Promise(r => setTimeout(r, 2000));
        }
        process.exit(0);
    } catch (err) {
        console.error(err.response?.data || err.message);
        process.exit(1);
    }
}

generate();
