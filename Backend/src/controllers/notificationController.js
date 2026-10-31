const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const notificationService = require('../services/notificationService');
const { listNotificationsQuerySchema } = require('../validators/notificationValidator');

// GET /notifications?page=1&limit=20&unreadOnly=true
exports.list = asyncHandler(async (req, res) => {
  const parsed = listNotificationsQuerySchema.safeParse(req.query);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  const result = await notificationService.listForUser({
    userId: req.user._id,
    ...parsed.data,
  });

  res.json({ success: true, data: result });
});

// GET /notifications/unread-count
exports.unreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.unreadCount(req.user._id);
  res.json({ success: true, data: { unread: count } });
});

// PATCH /notifications/:id/read
exports.markRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markRead(req.user._id, req.params.id);
  res.json({ success: true, data: notification });
});

// PATCH /notifications/read-all
exports.markAllRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllRead(req.user._id);
  res.json({ success: true, data: result });
});