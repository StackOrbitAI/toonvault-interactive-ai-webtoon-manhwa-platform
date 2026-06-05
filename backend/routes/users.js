const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Story = require('../models/Story');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// Get all users (Admin only)
router.get('/', auth, adminOnly, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update current user profile
router.patch('/me', auth, async (req, res) => {
    try {
        const { username, phone, address } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { username, phone, address },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get my stories
router.get('/my-stories', auth, async (req, res) => {
    try {
        const stories = await Story.find({ authorId: req.user.id }).sort({ createdAt: -1 });
        res.json(stories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new story
router.post('/my-stories', auth, async (req, res) => {
    try {
        const { title, genre, description, type, status } = req.body;
        const story = new Story({
            title,
            genre,
            description,
            type: type || 'Comic',
            status: status || 'Draft',
            authorId: req.user.id,
            authorName: req.user.username,
            coverIcon: req.body.coverIcon || '📖',
            coverBg: req.body.coverBg || '#1A1628',
        });
        await story.save();
        res.status(201).json(story);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update my story
router.patch('/my-stories/:id', auth, async (req, res) => {
    try {
        const story = await Story.findOneAndUpdate(
            { _id: req.params.id, authorId: req.user.id },
            req.body,
            { new: true }
        );
        if (!story) return res.status(404).json({ error: 'Story not found or not authorized' });
        res.json(story);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete my story
router.delete('/my-stories/:id', auth, async (req, res) => {
    try {
        await Story.findOneAndDelete({ _id: req.params.id, authorId: req.user.id });
        res.json({ message: 'Story deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ban/Unban user (Admin only)
router.patch('/:id/status', auth, adminOnly, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update User Plan
router.post('/update-plan', auth, async (req, res) => {
    try {
        const { plan } = req.body;
        const user = await User.findByIdAndUpdate(req.user.id, { plan }, { new: true }).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Toggle Bookmark
router.post('/bookmarks/:storyId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const storyId = req.params.storyId;
        const index = user.bookmarks.indexOf(storyId);
        if (index === -1) {
            user.bookmarks.push(storyId);
            await user.save();
            res.json({ message: 'Bookmarked', bookmarked: true });
        } else {
            user.bookmarks.splice(index, 1);
            await user.save();
            res.json({ message: 'Unbookmarked', bookmarked: false });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark Node as Read
router.post('/read-nodes/:storyId/:nodeId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const { storyId, nodeId } = req.params;
        const exists = user.readNodes.find(n => n.storyId.toString() === storyId && n.nodeId === nodeId);
        if (!exists) {
            user.readNodes.push({ storyId, nodeId });
            user.storiesRead = (user.storiesRead || 0) + 1;
            await user.save();
        }
        res.json({ message: 'Marked as read', read: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark Node as Unread
router.delete('/read-nodes/:storyId/:nodeId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const { storyId, nodeId } = req.params;
        user.readNodes = user.readNodes.filter(n => !(n.storyId.toString() === storyId && n.nodeId === nodeId));
        await user.save();
        res.json({ message: 'Marked as unread', read: false });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Toggle Follow Creator
router.post('/follow/:username', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const targetUsername = req.params.username;
        if (!user.following) {
            user.following = [];
        }
        const index = user.following.indexOf(targetUsername);
        if (index === -1) {
            user.following.push(targetUsername);
            await user.save();
            res.json({ message: `Following ${targetUsername}`, following: true });
        } else {
            user.following.splice(index, 1);
            await user.save();
            res.json({ message: `Unfollowed ${targetUsername}`, following: false });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

