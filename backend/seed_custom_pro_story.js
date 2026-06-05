const mongoose = require('mongoose');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const MISTRAL_KEY = process.env.MISTRAL_API_KEY || "YOUR_MISTRAL_API_KEY";
const RUNWARE_KEY = process.env.RUNWARE_API_KEY || "YOUR_RUNWARE_API_KEY";
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/toonvault';

const Story = require('./models/Story');
const User = require('./models/User');

async function generateImages(panels, category) {
    console.log(`🎨 Generating ${panels.length} panels...`);
    let imageUrls = [];
    
    try {
        if (!RUNWARE_KEY) throw new Error("No Runware Key");

        const runwareTasks = [
            { taskType: "authentication", apiKey: RUNWARE_KEY },
            ...panels.map((p) => ({
                taskType: "imageInference",
                taskUUID: crypto.randomUUID(),
                model: "civitai:257749@290640", // Pony Diffusion V6 XL SFW
                positivePrompt: `score_9, score_8_up, score_7_up, masterpiece, best quality, beautiful manhwa style, dramatic webtoon aesthetic, rich vibrant colors, high resolution, safe for work, ${p.imagePrompt}`,
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
            throw new Error("Runware returned empty list");
        }
        console.log(`✅ Generated ${imageUrls.length} images via Runware.`);
    } catch (err) {
        console.warn("⚠️ Runware generation failed. Falling back to dynamic high-fidelity Pollinations AI:", err.message);
        imageUrls = panels.map((p) => {
            const cleanPrompt = `masterpiece, best quality, highly detailed manhwa style, beautiful romance webtoon aesthetic, rich vibrant colors, safe for work, ${p.imagePrompt}`;
            const seed = Math.floor(Math.random() * 1000000);
            return `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=512&height=768&nologo=true&seed=${seed}`;
        });
    }

    return imageUrls;
}

async function run() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Get admin user
        const admin = await User.findOne({ role: 'admin' }) || await User.findOne() || { _id: "69e7a4cbbd3f6e75334d5f2d", username: "admin" };
        
        console.log('🚀 Step 1: Generating Webtoon Script with Mistral AI...');
        
        const mistralResp = await axios.post('https://api.mistral.ai/v1/chat/completions', {
            model: "mistral-small-latest",
            messages: [{
                role: "system",
                content: "You are an elite Otome Isekai (Romance Fantasy) webtoon writer. Your output MUST be a JSON object with: title, description, coverIcon, coverBg, genre, episodes (an array of length 3). The first episode should have 'number': 1, 'title': 'The Cursed Healer', and an array 'panels' of length 10. The second episode should have 'number': 2, 'title': 'The Tyrant\\'s Proposal', and an array 'panels' of length 6. The third episode should have 'number': 3, 'title': 'Secrets of the Palace', and an array 'panels' of length 6. In each episode's 'panels' array, each item has 'text' (dialogue/narration) and 'imagePrompt' (detailed, colorful webtoon panel illustration instructions for Pony/Flux AI, SFW). Every panel must be visually rich, colorful, and unique."
            }, {
                role: "user",
                content: "Create a pilot and two follow-up episodes for a premium webtoon titled 'I Became the Tyrant\\'s Secret Healer'. She was an ordinary pharmacist reborn as a cursed priestess whose touch heals any injury but transfers a fraction of the target's physical pain to herself. The male lead is a cold, lethal emperor who suffers from a soul-consuming curse."
            }],
            response_format: { type: "json_object" }
        }, { headers: { 'Authorization': `Bearer ${MISTRAL_KEY}` } });

        const storyData = JSON.parse(mistralResp.data.choices[0].message.content);
        console.log(`✅ Webtoon script generated successfully! Title: "${storyData.title}"`);

        // Generate Episode 1
        console.log('\n🎬 Generating Episode 1 panels...');
        const ep1Panels = await generateImages(storyData.episodes[0].panels, storyData.genre);

        // Generate Episode 2
        console.log('\n🎬 Generating Episode 2 panels...');
        const ep2Panels = await generateImages(storyData.episodes[1].panels, storyData.genre);

        // Generate Episode 3
        console.log('\n🎬 Generating Episode 3 panels...');
        const ep3Panels = await generateImages(storyData.episodes[2].panels, storyData.genre);

        // Map branching nodes for the Interactive Story Map tab
        const choiceNodes = [
            { id: 's1', type: 'scene', label: 'Scene 1', title: 'Rebirth & Remedy', status: 'read', x: 0, y: 0 },
            { id: 's2', type: 'scene', label: 'Scene 2', title: 'The Silent Emperor', status: 'read', x: 120, y: 0 },
            { id: 's3', type: 'scene', label: 'Scene 3', title: 'The Touch of Healing', status: 'read', x: 240, y: 0 },
            { id: 's4', type: 'scene', label: 'Scene 4', title: 'Soul Pain Tradeoff', status: 'read', x: 360, y: 0 },
            { id: 'c1', type: 'choice', label: 'A', title: 'Accept the Royal Proposal', status: 'unlocked', isPopular: true, x: 500, y: -90, parentId: 's4' },
            { id: 'c2', type: 'choice', label: 'B', title: 'Flee the Palace at Night', status: 'locked', x: 500, y: -30, parentId: 's4' },
            { id: 'c3', type: 'choice', label: 'C', title: 'Reveal the Curse Secret', status: 'locked', x: 500, y: 30, parentId: 's4' },
            { id: 'c4', type: 'choice', label: 'D', title: 'Demand a Healing Contract', status: 'locked', x: 500, y: 90, parentId: 's4' },
        ];

        // Format Episodes list
        const formattedEpisodes = [
            {
                number: 2,
                title: storyData.episodes[1].title,
                panels: ep2Panels,
                content: JSON.stringify(storyData.episodes[1].panels.map(p => ({ text: p.text }))),
                createdAt: new Date(Date.now() - 86400000)
            },
            {
                number: 3,
                title: storyData.episodes[2].title,
                panels: ep3Panels,
                content: JSON.stringify(storyData.episodes[2].panels.map(p => ({ text: p.text }))),
                createdAt: new Date()
            }
        ];

        // Create new Story object
        const newStory = new Story({
            title: storyData.title || "I Became the Tyrant's Secret Healer",
            genre: Array.isArray(storyData.genre) ? storyData.genre[0] : (storyData.genre || "Romance"),
            coverIcon: storyData.coverIcon || "🌸",
            coverBg: storyData.coverBg || "#1A0915",
            authorId: admin._id.toString(),
            authorName: admin.username || "ToonVault AI",
            views: 1245000,
            rating: 9.9,
            likes: 489000,
            status: "Live",
            type: "Comic",
            description: storyData.description || "A rebirth romance fantasy webtoon of high stakes.",
            content: JSON.stringify(storyData.episodes[0].panels.map(p => ({ text: p.text }))),
            panels: ep1Panels,
            nodes: choiceNodes,
            episodes: formattedEpisodes
        });

        // Save story
        await newStory.save();
        console.log(`\n✨ SUCCESS! Professional webtoon seeded beautifully into the database!`);
        console.log(`Story ID: ${newStory._id}`);
        console.log(`Title: ${newStory.title}`);
        console.log(`Link: http://localhost:5000/api/stories/${newStory._id}`);
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding professional story:', err.response?.data || err.message);
        process.exit(1);
    }
}

run();
