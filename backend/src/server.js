const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
require('dotenv').config();

const config = require('./config/config');
const { sequelize } = require('./models');
const routes = require('./routes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit(config.rateLimit);
app.use('/api/', limiter);

// Routes
app.use('/api', routes);

app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    const facebookApiStatus = await checkFacebookApiStatus();
    res.status(200).json({ status: 'ok', database: 'connected', facebookApi: facebookApiStatus });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', facebookApi: 'disconnected', error: error.message });
  }
});

async function checkFacebookApiStatus() {
  try {
    await axios.get(`https://graph.facebook.com/${config.facebook.apiVersion}/?access_token=${config.facebook.accessToken}`);
    return 'connected';
  } catch (error) {
    return 'disconnected';
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: config.nodeEnv === 'development' ? err.message : undefined
  });
});

// Database sync and server start
const PORT = config.port;

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync database models
    await sequelize.sync({ alter: config.nodeEnv === 'development' });
    console.log('Database models synchronized.');

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
