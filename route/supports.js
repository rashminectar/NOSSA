const Supports = require('../controllers/supports_ctrl');
const router = require('express').Router();
const middileware = require('../middileware');

router.get('/', middileware.checkAuthentication, middileware.checkAdminAuthentication, Supports.get);
router.post('/add', middileware.checkAuthentication, Supports.add);

module.exports = router;