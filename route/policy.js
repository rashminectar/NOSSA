const express = require('express');
const middileware = require('../middileware')
const router = express.Router()
const policy = require('../controllers/policy_ctrl')

router.get('/', middileware.checkAuthentication, policy.getAllPolicy);
router.post('/add', middileware.checkAuthentication, policy.create);
router.put('/edit', middileware.checkAuthentication, policy.create);
router.delete('/delete', middileware.checkAuthentication, policy.delete);

router.get('/getAllUserPolicy', middileware.checkAuthentication, middileware.checkuserPolicyAuthentication, policy.getAllUserPolicy);

module.exports = router