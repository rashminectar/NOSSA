const express = require('express');
const middileware = require('../middileware');
const router = express.Router();
const client = require('../controllers/client_ctrl');

// router.get('/', client.getAllClient);
router.post('/add', middileware.checkAuthentication, middileware.checkClientCreateAuthentication, client.add);

module.exports = router