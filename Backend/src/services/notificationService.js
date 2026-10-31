const Notification = require('../models/Notification');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { emitToUser } = require('../config/socket');
const { enqueueEmail } = require('../queues/emailQueue');

const escapeHtml = (text = '') =>
  String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const notify = async ({ recipientId, type, title, message, data = {}, email = false }) => {
  const notification = await Notification.create({
    recipient: recipientId,
    type,
    title,
    message,
    data,
  });

  // Real-time: agar user online hai to turant mil jayega
  emitToUser(recipientId, 'notification:new', notification);

  if (email) {
    const user = await User.findById(recipientId).select('email name').lean();
    if (user?.email) {
      await enqueueEmail({
        to: user.email,
        subject: title,
        html: `<p>Hi ${escapeHtml(user.name)},</p><p>${escapeHtml(message)}</p>`,
      });
    }
  }

  return notification;
};

const listForUser = async ({ userId, page, limit, unreadOnly }) => {
  const filter = { recipient: userId };
  if (unreadOnly) filter.isRead = false;

  const [items, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
  ]);

  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
};

const unreadCount = (userId) =>
  Notification.countDocuments({ recipient: userId, isRead: false });

const markRead = async (userId, notificationId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
  if (!notification) throw new AppError('Notification not found', 404);
  return notification;
};

const markAllRead = async (userId) => {
  const result = await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
  return { updated: result.modifiedCount };
};

module.exports = {
  notify,
  listForUser,
  unreadCount,
  markRead,
  markAllRead,
};