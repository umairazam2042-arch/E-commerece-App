const router = require('express').Router();
const { protect } = require('../middlewares/auth');
const ctrl = require('../controllers/notificationController');

router.use(protect);

// read-all ko /:id/read se pehle rakhna zaroori hai
router.get('/', ctrl.list);
router.get('/unread-count', ctrl.unreadCount);
router.patch('/read-all', ctrl.markAllRead);
router.patch('/:id/read', ctrl.markRead);

module.exports = router;