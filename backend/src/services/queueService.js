const Queue = require('bull');
const Redis = require('ioredis');
const config = require('../config/config');

const redisClient = new Redis(config.redis);
const facebookApiQueue = new Queue('facebook-api-requests', {
  createClient: () => redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

module.exports = {
  facebookApiQueue,
};
