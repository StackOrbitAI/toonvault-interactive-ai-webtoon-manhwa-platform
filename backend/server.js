const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Story = require('./models/Story');
const Payment = require('./models/Payment');
const Setting = require('./models/Setting');
const redis = require('./redisClient');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Middleware
app.use(cors({ origin: '*' }));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(express.json());

// Serving built frontend at root /
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Fallback for React Router (SPA)
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Routes Integration
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/stories', require('./routes/stories'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));

// Public Settings
app.get('/api/settings/public', async (req, res) => {
    try {
        const settings = await Setting.find({ key: { $in: ['show_creator_popup', 'site_name', 'maintenance_mode', 'payment_paypal_enabled', 'payment_stripe_enabled'] } });
        const config = {};
        settings.forEach(s => config[s.key] = s.value);
        res.json(config);
    } catch (err) { res.json({}); }
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/toonvault';
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ ToonVault MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Error:', err));

// Real-time Pulse
io.on('connection', (socket) => {
    console.log('⚡ Admin Console Connected');
    
    const sendPulse = async () => {
        try {
            const stats = await Promise.all([
                User.countDocuments(),
                Story.countDocuments(),
                Payment.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
                Story.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }])
            ]);
            
            socket.emit('live_stats', {
                users: stats[0],
                stories: stats[1],
                revenue: stats[2][0]?.total || 0,
                views: stats[3][0]?.total || 0
            });
        } catch (e) {
            console.error('Pulse Error:', e);
        }
    };

    const pulseInterval = setInterval(sendPulse, 8000);
    sendPulse(); // Initial

    socket.on('disconnect', () => clearInterval(pulseInterval));
});

// Bootstrapping
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', async () => {
    console.log(`
    ================================================
       TOONVAULT MULTI-DB BACKEND IS RUNNING
    ================================================
       API ENDPOINT: http://localhost:${PORT}/api
       ADMIN PANEL : http://localhost:${PORT}/admin
    ================================================
    `);
});
