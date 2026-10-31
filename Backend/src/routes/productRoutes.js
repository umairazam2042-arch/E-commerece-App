const router = require('express').Router();
const { listPublic, getPublic } = require('../controllers/productController');

router.get('/', listPublic);
router.get('/:id', getPublic);

module.exports = router;