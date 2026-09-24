const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

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

// Initialize database connection
connectDB();

const app = express();

// Helper to check if origin is permitted
const isOriginAllowed = (origin) => {
  if (!origin) return true; // Requests without origin (curl, mobile, postman, health check)

  // Wildcard allowed
  if (process.env.CLIENT_URL === '*') return true;

  // Development mode allows all origins
  if (process.env.NODE_ENV !== 'production') return true;

  const normalizedOrigin = origin.replace(/\/$/, '');

  // Default permitted origins list
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

  // Add any origins from CLIENT_URL (supports comma-separated list)
  if (process.env.CLIENT_URL) {
    const envOrigins = process.env.CLIENT_URL.split(',')
      .map((u) => u.trim().replace(/\/$/, ''))
      .filter(Boolean);
    baseAllowed.push(...envOrigins);
  }

  if (baseAllowed.includes(normalizedOrigin)) return true;

  // Pattern match for Vercel preview & production deployments (*.vercel.app)
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

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 [CareerCompassAI Server Active] Listening on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  // Keep server running in development
});

module.exports = app;
