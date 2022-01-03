var express = require('express')
var router = express.Router()
var account = require('../controllers/account_ctrl')
const middileware = require('../middileware')

router.post('/userRegistration', account.userRegistration);
router.post('/userLogin', account.userLogin);
router.post('/getUserByToken', account.getUserByToken);
router.get('/emailVerification/:token', account.emailVerification);
router.post('/getUserById', account.getUserById);

router.post('/forgotPassword', account.forgotPassword);
router.post('/resetPassword', account.resetPassword);
router.post('/changePassword', middileware.checkAuthentication, account.changePassword);
router.put('/updateProfile', middileware.checkAuthentication, account.updateProfile);

router.post('/getAllUsers', middileware.checkAuthentication, account.getAllUsers);

module.exports = router;