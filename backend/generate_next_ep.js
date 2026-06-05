const mongoose = require('mongoose');
const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const Story = require('./models/Story');

async function generateNextEpisode() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/toonvault');
        
        // 1. Get user and create token
        const user = await User.findOne({ email: 'demo@toonvault.com' }) || await User.findOne();
        if (!user) {
            console.error("No user found");
            process.exit(1);
        }
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role, plan: user.plan },
            process.env.JWT_SECRET || 'sakura_secret_key_2026',
            { expiresIn: '1d' }
        );

        // 2. Find specific story
        const story = await Story.findById("6a22ee4035f9acdd5b7e3e1a");
        if (!story) {
            console.error("Story 'My Professor, My Heart' not found");
            process.exit(1);
        }

        console.log(`Generating episode for story: "${story.title}" (ID: ${story._id})...`);

        // 3. Call the API
        const response = await axios.post('http://localhost:5000/api/stories/generate-episode', {
            storyId: story._id,
            prompt: "Episode 3 — The Confession. Under the falling autumn leaves, Yuna finally confesses her feelings to Professor Seo. Professor Seo is caught between academic rules and his own growing feelings, leading to an intense, emotional confrontation."
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log("✅ Episode generated successfully!");
        console.log(`🔗 Link to read: https://toonvault.com/manta/${story._id}`);
        process.exit(0);

    } catch (err) {
        console.error("Error generating episode:", err.response?.data || err.message);
        process.exit(1);
    }
}

generateNextEpisode();
