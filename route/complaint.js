const express = require('express');
const middileware = require('../middileware/index')
const complaintMiddileware = require('../middileware/complaint')
const router = express.Router()
const complaints = require('../controllers/complaint_ctrl')

router.get('/', middileware.checkAuthentication, complaintMiddileware.checkComplaintGetAuthentication, complaints.getAllComplaint);
router.post('/add', middileware.checkAuthentication, complaintMiddileware.checkComplaintCreateAuthentication, complaints.add);
router.put('/edit', middileware.checkAuthentication, complaintMiddileware.checkComplaintDeleteAuthentication, complaints.edit);
router.delete('/delete', middileware.checkAuthentication, complaintMiddileware.checkComplaintDeleteAuthentication, complaints.delete);
router.post('/verifyRequest', middileware.checkAuthentication, complaintMiddileware.checkComplaintVerifyAuthentication, complaints.verifyRequest);

module.exports = router