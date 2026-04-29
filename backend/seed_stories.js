const mongoose = require('mongoose');
const axios = require('axios');
const Story = require('./models/Story');
const User = require('./models/User');
const crypto = require('crypto');

const MISTRAL_KEY = "VztpyOHj6iS6uF8FKNRvLLxFeG3oS3RR";
const RUNWARE_KEY = "qHl8dL3BSobrD7j52dc2aTMK4E1lRQTy";
const MONGO_URI = 'mongodb://mongo:27017/toonvault';

const TOPICS = [
    "A cold duke falling for a cheerful commoner",
    "A villainess who decides to become a farmer",
    "A modern chef transported to a fantasy world royal kitchen",
    "A contract marriage between two rival CEOs",
    "A high school romance involving a secret idol",
    "A priestess who accidentally summons a very polite demon",
    "The legendary swordmaster's retirement plan",
    "A story about a cat that is actually a cursed prince",
    "A vampire who is afraid of blood",
    "A girl who can talk to ghosts of famous painters"
];

async function generateStory(topic, admin) {
    try {
        console.log(`\nGenerating: ${topic}`);
        
        const mistralResp = await axios.post('https://api.mistral.ai/v1/chat/completions', {
            model: "mistral-small-latest",
            messages: [{
                role: "system",
                content: "You are a professional webtoon writer for Manta. Output ONLY a JSON object with: title, description, and an array 'panels' (length 5) where each item has 'text' (dialogue/narration) and 'imagePrompt' (Masterpiece, best quality, webtoon style, anime aesthetic, flat color, high contrast, vibrant, [subject description])."
            }, {
                role: "user",
                content: `Create a Manta-style webtoon story about: ${topic}. Each panel should have a clear dialogue or narration.`
            }],
            response_format: { type: "json_object" }
        }, { headers: { 'Authorization': `Bearer ${MISTRAL_KEY}` } });

        const aiOutput = JSON.parse(mistralResp.data.choices[0].message.content);
        const { title, description, panels: storyPanels } = aiOutput;

        const runwareTasks = [
            { taskType: "authentication", apiKey: RUNWARE_KEY },
            ...storyPanels.map((p, idx) => ({
                taskType: "imageInference",
                taskUUID: crypto.randomUUID(),
                model: "runware:100@1", // Flux Dev
                positivePrompt: `manga cover style, webtoon art, manhwa aesthetic, high quality, colorful, clean lines, ${p.imagePrompt}`,
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
            genre: ["Romance", "Fantasy", "Drama", "Comedy"][Math.floor(Math.random() * 4)],
            authorId: admin._id,
            authorName: admin.username,
            status: 'Live',
            type: 'Comic',
            description: description,
            content: JSON.stringify(storyPanels),
            panels: imageUrls,
            coverIcon: "✨",
            views: Math.floor(Math.random() * 50000) + 1000,
            likes: Math.floor(Math.random() * 5000) + 100,
            rating: (Math.random() * 1 + 4).toFixed(1)
        });

        await newStory.save();
        console.log(`✅ Saved: ${title}`);
    } catch (e) {
        console.error(`❌ Failed: ${topic}`, e.response?.data || e.message);
    }
}

async function run() {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB. Clearing old stories...");
    await Story.deleteMany({}); // Clear old ones to make room for the good ones
    
    const admin = await User.findOne({ role: 'admin' }) || await User.findOne();
    
    for (const topic of TOPICS) {
        await generateStory(topic, admin);
        await new Promise(r => setTimeout(r, 4000));
    }
    
    process.exit(0);
}

run();
