const express = require('express');
const middileware = require('../middileware/index')
const claimMiddileware = require('../middileware/claim')
const router = express.Router()
const claim = require('../controllers/claim_ctrl')

router.get('/', middileware.checkAuthentication, claimMiddileware.checkClaimGetAuthentication, claim.getAllClaim);
router.post('/add', middileware.checkAuthentication, claimMiddileware.checkClaimCreateAuthentication, claim.add);
router.put('/edit', middileware.checkAuthentication, claimMiddileware.checkClaimDeleteAuthentication, claim.edit);
router.delete('/delete', middileware.checkAuthentication, claimMiddileware.checkClaimDeleteAuthentication, claim.delete);
router.post('/verifyRequest', middileware.checkAuthentication, claimMiddileware.checkClaimVerifyAuthentication, claim.verifyRequest);

module.exports = router