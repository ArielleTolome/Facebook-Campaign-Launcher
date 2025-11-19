module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  facebook: {
    appId: process.env.FB_APP_ID,
    appSecret: process.env.FB_APP_SECRET,
    accessToken: process.env.FB_ACCESS_TOKEN,
    apiVersion: process.env.FB_API_VERSION || 'v18.0'
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
  }
};
