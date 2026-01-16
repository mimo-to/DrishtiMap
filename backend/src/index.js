const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error.middleware');
const responseTime = require('./middleware/responseTime.middleware');

// Load env vars
dotenv.config();

// Initialize App
const app = express();
const PORT = process.env.PORT || 5000;

// 1. Security Headers
app.use(helmet());

// 2. CORS
app.use(cors());

// 3. Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Logging (Dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// 5. Response Time Monitoring
app.use(responseTime);

// Connect to Database
connectDB();

// 5. Routes
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'DrishtiMap Backend'
  });
});

// API Routes Placeholder
// API Routes
app.use('/api', require('./routes/index'));

// Dev-only Auth Test Routes
// Dev-only Auth Test Routes
if (process.env.NODE_ENV !== 'production') {
  // Removed auth-test routes
}

// 6. Error Handling
app.use(notFound);
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

