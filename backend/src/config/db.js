const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!uri) {
        console.warn(' MongoDB URI not found in environment variables (checked MONGO_URI and MONGODB_URI).');
        return;
    }
    
    const cleanUri = uri.trim();
    
    const conn = await mongoose.connect(cleanUri);
    
    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(` MongoDB Connection Error: ${error.message}`);
  }
};

module.exports = connectDB;
