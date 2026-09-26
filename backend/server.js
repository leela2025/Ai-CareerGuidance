const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const careerRoutes = require('./routes/careerRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const journeyRoutes = require('./routes/journeyRoutes');
const securityRoutes = require('./routes/securityRoutes');
const mentorRoutes = require('./routes/mentorRoutes');
const connectionRoutes = require('./routes/connectionRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const storyRoutes = require('./routes/storyRoutes');
const skillRoutes = require('./routes/skillRoutes');
const projectRoutes = require('./routes/projectRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Model imports for Socket.IO authentication & persistence
const User = require('./models/User');
const Conversation = require('./models/Conversation');

// Initialize database connection
connectDB();

const app = express();
const server = http.createServer(app);

// Helper to check if origin is permitted
const isOriginAllowed = (origin) => {
  if (!origin) return true; // Requests without origin (curl, mobile, postman, health check)

  if (process.env.CLIENT_URL === '*') return true;
  if (process.env.NODE_ENV !== 'production') return true;

  const normalizedOrigin = origin.replace(/\/$/, '');

  const baseAllowed = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:4173',
    'https://ai-career-guidance-lk2tlaqkg-leelas-projects-e073c52d.vercel.app',
    'https://ai-career-guidance-leelas-projects-e073c52d.vercel.app',
    'https://ai-career-guidance.vercel.app',
  ];

  if (process.env.CLIENT_URL) {
    const envOrigins = process.env.CLIENT_URL.split(',')
      .map((u) => u.trim().replace(/\/$/, ''))
      .filter(Boolean);
    baseAllowed.push(...envOrigins);
  }

  if (baseAllowed.includes(normalizedOrigin)) return true;

  try {
    const parsed = new URL(normalizedOrigin);
    if (
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      parsed.hostname.endsWith('.vercel.app')
    ) {
      return true;
    }
  } catch (e) {
    // Malformed origin
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ [CORS Policy] Blocked origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Base / Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    project: 'CareerCompassAI API',
    version: '1.0.0',
    model: 'claude-sonnet-4-6',
    realtimeChat: 'socket.io enabled',
    timestamp: new Date().toISOString(),
  });
});

// Mount API modules
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/journey', journeyRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// =========================================================================
// REAL-TIME CHAT ENGINE (Socket.IO with JWT Handshake Authentication)
// =========================================================================
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Authenticate socket handshake using JWT
io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(' ')[1] ||
      socket.handshake.query?.token;

    if (!token) {
      return next(new Error('Authentication token required for Socket.IO connection'));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'career_compass_default_secret_key_2026'
    );

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new Error('User matching token not found'));
    }

    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Socket.IO JWT authentication error: ' + err.message));
  }
});

io.on('connection', (socket) => {
  // Join a specific conversation room
  socket.on('join-conversation', async (conversationId) => {
    try {
      const conv = await Conversation.findById(conversationId);
      if (!conv) {
        return socket.emit('error-message', 'Conversation not found.');
      }

      // Verify authorization
      const isParticipant = conv.participants.some(
        (p) => p.toString() === socket.user._id.toString()
      );
      if (!isParticipant) {
        return socket.emit('error-message', 'Access denied. You are not a participant in this conversation.');
      }

      socket.join(conversationId);
    } catch (err) {
      socket.emit('error-message', err.message);
    }
  });

  // Leave conversation room
  socket.on('leave-conversation', (conversationId) => {
    socket.leave(conversationId);
  });

  // Real-time message broadcast & persistence
  socket.on('send-message', async ({ conversationId, text }) => {
    try {
      if (!text || !text.trim()) return;

      const conv = await Conversation.findById(conversationId);
      if (!conv) {
        return socket.emit('error-message', 'Conversation not found');
      }

      const isParticipant = conv.participants.some(
        (p) => p.toString() === socket.user._id.toString()
      );
      if (!isParticipant) {
        return socket.emit('error-message', 'Not authorized to send messages');
      }

      const newMsg = {
        sender: socket.user._id,
        text: text.trim(),
        timestamp: new Date(),
        read: false,
      };

      conv.messages.push(newMsg);
      conv.lastMessageAt = new Date();
      await conv.save();

      const savedMsg = conv.messages[conv.messages.length - 1];

      // Broadcast to room
      io.to(conversationId).emit('new-message', {
        conversationId,
        message: {
          _id: savedMsg._id,
          sender: {
            _id: socket.user._id,
            name: socket.user.name,
            avatar: socket.user.avatar || '',
          },
          text: savedMsg.text,
          timestamp: savedMsg.timestamp,
          read: false,
        },
      });
    } catch (err) {
      console.error('Socket message send error:', err.message);
      socket.emit('error-message', 'Failed to send message: ' + err.message);
    }
  });

  // Typing status indicator
  socket.on('typing', ({ conversationId, isTyping }) => {
    socket.to(conversationId).emit('user-typing', {
      conversationId,
      userId: socket.user._id,
      userName: socket.user.name,
      isTyping,
    });
  });

  // Mark messages read
  socket.on('mark-read', async ({ conversationId }) => {
    try {
      const conv = await Conversation.findById(conversationId);
      if (!conv) return;

      let changed = false;
      conv.messages.forEach((msg) => {
        if (msg.sender.toString() !== socket.user._id.toString() && !msg.read) {
          msg.read = true;
          changed = true;
        }
      });

      if (changed) {
        await conv.save();
        socket.to(conversationId).emit('messages-read', { conversationId });
      }
    } catch (err) {
      console.warn('mark-read socket error:', err.message);
    }
  });

  socket.on('disconnect', () => {
    // User disconnected cleanly
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 [CareerCompassAI Server Active] Listening on port ${PORT}`);
  console.log(`💬 Real-Time Chat Engine Active (Socket.IO mounted)`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
});

module.exports = app;
