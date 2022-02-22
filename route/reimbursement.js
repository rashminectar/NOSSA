const Reimbursement = require('../controllers/reimbursement_ctrl');
const express = require('express');
const middileware = require('../middileware/index')
const router = require('express').Router()

router.get('/getDoctor', middileware.checkAuthentication, Reimbursement.getDoctor)
router.post('/addDoctor', middileware.checkAuthentication, middileware.checkAdminAuthentication, Reimbursement.addDoctor)
router.put('/editDoctor', middileware.checkAuthentication, middileware.checkAdminAuthentication, Reimbursement.updateDoctor)
router.delete('/deleteDoctor', middileware.checkAuthentication, middileware.checkAdminAuthentication, Reimbursement.deleteDoctor)

router.get('/getService', middileware.checkAuthentication, Reimbursement.getServices)
router.post('/addService', middileware.checkAuthentication, middileware.checkAdminAuthentication, Reimbursement.addServices)
router.put('/editService', middileware.checkAuthentication, middileware.checkAdminAuthentication, Reimbursement.updateServices)
router.delete('/deleteService', middileware.checkAuthentication, middileware.checkAdminAuthentication, Reimbursement.deleteServices)

router.get('/', middileware.checkAuthentication, Reimbursement.getReimbursement)
router.post('/add', middileware.checkAuthentication, middileware.checkAdminAuthentication, Reimbursement.addReimbursement)
router.put('/edit', middileware.checkAuthentication, middileware.checkAdminAuthentication, Reimbursement.updateReimbursement)
router.delete('/delete', middileware.checkAuthentication, middileware.checkAdminAuthentication, Reimbursement.deleteReimbursement)

module.exports = router;