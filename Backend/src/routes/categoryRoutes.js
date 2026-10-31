const router = require('express').Router();
const { listPublic } = require('../controllers/categoryController');

router.get('/', listPublic);

module.exports = router;