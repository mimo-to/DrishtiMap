const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!uri) {
        console.warn(' MongoDB URI not found in environment variables (checked MONGO_URI and MONGODB_URI).');
        // List loaded keys for debug
        const keys = Object.keys(process.env).filter(k => !k.startsWith('npm_'));
        console.log('Loaded Env Keys:', keys.join(', '));
        return;
    }
    
    // Auto-fix common paste errors (whitespace)
    const cleanUri = uri.trim();
    
    const conn = await mongoose.connect(cleanUri);
    
    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(` MongoDB Connection Error: ${error.message}`);
    // Intentionally NOT exiting process per "Hackathon Rules":
    // process.exit(1); 
  }
};

module.exports = connectDB;
