const mongoose = require('mongoose');
const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '/app/.env' });

const User = require('/app/models/User');
const Story = require('/app/models/Story');

async function run() {
    await mongoose.connect('mongodb://mongo:27017/toonvault');
    const user = await User.findOne({ email: 'demo@toonvault.com' }) || await User.findOne();
    const token = jwt.sign(
        { id: user._id, username: user.username, role: user.role, plan: user.plan },
        process.env.JWT_SECRET || 'sakura_secret_key_2026',
        { expiresIn: '1d' }
    );

    const story = await Story.findOne().sort({ createdAt: -1 });
    console.log('Generating episode for story:', story.title);

    try {
        const response = await axios.post('http://localhost:5000/api/stories/generate-episode', {
            storyId: story._id,
            prompt: "The ultimate climax and a new beginning. Show the epic resolution."
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log("✅ API SUCCESS!");
        console.log(`🔗 Link to read: https://toonvault.com/manta/${story._id}`);
    } catch (e) {
        console.error("API FAILED:", e.response?.data || e.message);
    }
    process.exit(0);
}
run();
