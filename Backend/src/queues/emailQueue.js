const { Queue } = require('bullmq');
const { redisConnection } = require('../config/redis');
const { sendEmail } = require('../config/mailer');

const emailQueue = redisConnection
  ? new Queue('email', { connection: redisConnection })
  : null;

const enqueueEmail = async (payload) => {
  if (emailQueue) {
    await emailQueue.add('send', payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: true,
      removeOnFail: 100,
    });
    return;
  }

  // Redis nahi hai to direct bhejo, request ko block kiye baghair
  sendEmail(payload).catch((err) => console.error('Email failed:', err.message));
};

module.exports = { enqueueEmail };