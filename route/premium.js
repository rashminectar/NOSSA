const express = require('express');
const middileware = require('../middileware')
const router = express.Router()
const premium = require('../controllers/premium_ctrl')

router.get('/', premium.getAllPremium);
router.post('/payPremium', middileware.checkAuthentication, premium.payPremium);

module.exports = router