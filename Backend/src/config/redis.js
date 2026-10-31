const IORedis = require('ioredis');

// REDIS_URL na ho to null, aur email direct bheja jayega
const redisConnection = process.env.REDIS_URL
  ? new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
  : null;

module.exports = { redisConnection };