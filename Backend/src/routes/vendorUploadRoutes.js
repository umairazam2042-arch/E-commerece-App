const router = require('express').Router();
const { protect, restrictTo } = require('../middlewares/auth');
const { getUploadAuth } = require('../controllers/uploadController');

// Sirf approved vendor upload token le sakta hai
router.get('/auth', protect, restrictTo('vendor'), getUploadAuth);

module.exports = router;