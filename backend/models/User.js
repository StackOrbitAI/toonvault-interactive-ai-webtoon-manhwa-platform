const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['reader', 'creator', 'admin'], default: 'reader' },
    plan: { type: String, enum: ['Free', 'Bronze', 'Silver', 'Gold', 'bronze', 'silver', 'gold'], default: 'Free' },
    phone: { type: String },
    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zip: { type: String },
        country: { type: String, default: 'USA' }
    },
    billing: {
        cardNumber: { type: String }, // In real app, use PCI-compliant storage or tokens
        expiry: { type: String },
        cvv: { type: String }
    },
    status: { type: String, default: 'active' },
    coins: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    storiesRead: { type: Number, default: 0 },
    aiPanelsUsed: { type: Number, default: 0 },
    articlesGenerated: { type: Number, default: 0 },
    readNodes: [{
        storyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Story' },
        nodeId: String,
        readAt: { type: Date, default: Date.now }
    }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Story' }],
    following: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('User', UserSchema);
