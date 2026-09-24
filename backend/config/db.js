const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Windows DNS resolving MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore in environments where custom DNS servers cannot be set
}

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.warn('⚠️ [DB WARNING] MONGO_URI is not defined in environment variables.');
      console.warn('   Please provide a MongoDB Atlas connection string in your .env file.');
      return;
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });

    console.log(`✅ [MongoDB Atlas Connected] Host: ${conn.connection.host}, DB: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ [MongoDB Connection Error] ${error.message}`);
    // In production/local development, log clear diagnostic tips
    if (error.name === 'MongoServerSelectionError') {
      console.error('👉 Diagnostic Tip: Check your MongoDB Atlas Network Access whitelist (allow 0.0.0.0/0) and credentials in .env.');
    }
  }
};

module.exports = connectDB;
