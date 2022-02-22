const express = require('express');
const middileware = require('../middileware/index')
const serviceRequestMiddileware = require('../middileware/serviceRequest')
const router = express.Router()
const serviceRequest = require('../controllers/serviceRequest_ctrl')

router.get('/', middileware.checkAuthentication, serviceRequestMiddileware.checkServiceGetAuthentication, serviceRequest.getAllService);
router.post('/add', middileware.checkAuthentication, serviceRequestMiddileware.checkServiceCreateAuthentication, serviceRequest.add);
router.put('/edit', middileware.checkAuthentication, serviceRequestMiddileware.checkServiceDeleteAuthentication, serviceRequest.edit);
router.delete('/delete', middileware.checkAuthentication, serviceRequestMiddileware.checkServiceDeleteAuthentication, serviceRequest.delete);
router.post('/verifyRequest', middileware.checkAuthentication, serviceRequestMiddileware.checkServiceVerifyAuthentication, serviceRequest.verifyRequest);
router.post('/assignRequest', middileware.checkAuthentication, serviceRequestMiddileware.checkServiceVerifyAuthentication, serviceRequest.assignRequest);

module.exports = router