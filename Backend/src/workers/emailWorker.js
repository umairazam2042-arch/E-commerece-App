require('dotenv').config();

const { Worker } = require('bullmq');
const { redisConnection } = require('../config/redis');
const { sendEmail } = require('../config/mailer');

if (!redisConnection) {
  console.error('REDIS_URL set nahi hai, worker nahi chal sakta');
  process.exit(1);
}

const worker = new Worker(
  'email',
  async (job) => {
    await sendEmail(job.data);
  },
  { connection: redisConnection }
);

worker.on('completed', (job) => console.log(`Email sent (job ${job.id})`));
worker.on('failed', (job, err) => console.error(`Email failed (job ${job?.id}):`, err.message));

console.log('Email worker running...');