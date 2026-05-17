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
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1d' }
        );

        // 2. Find a story to add an episode to
        const story = await Story.findOne().sort({ createdAt: -1 });
        if (!story) {
            console.error("No story found to add an episode to");
            process.exit(1);
        }

        console.log(`Generating episode for story: "${story.title}" (ID: ${story._id})...`);

        // 3. Call the API
        const response = await axios.post('http://localhost:5000/api/stories/generate-episode', {
            storyId: story._id,
            prompt: "The ultimate climax begins! Reveal a shocking secret."
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
