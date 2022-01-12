const express = require('express');
const middileware = require('../middileware')
const router = express.Router()
const policy = require('../controllers/policy_ctrl')

router.get('/', policy.getAllPolicy);
router.post('/add', middileware.checkAuthentication, policy.create);
router.put('/edit', middileware.checkAuthentication, policy.create);
router.delete('/delete', middileware.checkAuthentication, policy.delete);
router.get('/exportReport', policy.exportReport);

router.get('/getAllUserPolicy', policy.getAllUserPolicy);
// router.get('/addUserPolicy', policy.addUserPolicy);
router.get('/exportUserPolicyReport', policy.exportUserPolicyReport);

module.exports = router