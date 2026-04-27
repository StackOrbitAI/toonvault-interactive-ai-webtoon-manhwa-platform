const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Story = require('../models/Story');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// Stats
router.get('/stats', auth, adminOnly, async (req, res) => {
    try {
        const users = await User.countDocuments();
        const stories = await Story.countDocuments();
        const payments = await Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);
        const views = await Story.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]);
        res.json({ users, stories, revenue: payments[0]?.total || 0, views: views[0]?.total || 0 });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// All Users
router.get('/users', auth, adminOnly, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Ban/Unban user
router.patch('/users/:id/status', auth, adminOnly, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json(user);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// All stories
router.get('/stories', auth, adminOnly, async (req, res) => {
    try {
        const stories = await Story.find().sort({ createdAt: -1 });
        res.json(stories);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update story status
router.patch('/stories/:id/status', auth, adminOnly, async (req, res) => {
    try {
        const story = await Story.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json(story);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Transactions
router.get('/transactions', auth, adminOnly, async (req, res) => {
    try {
        const payments = await Payment.find().sort({ createdAt: -1 }).limit(50);
        res.json(payments);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Settings
router.get('/settings', auth, adminOnly, async (req, res) => {
    res.json([
        { key: 'site_name', value: 'ToonVault' },
        { key: 'maintenance_mode', value: 'false' },
        { key: 'free_episode_interval_hrs', value: '3' },
        { key: 'coin_rate_usd', value: '1.00 = 100 coins' }
    ]);
});

module.exports = router;
