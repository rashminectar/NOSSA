var express = require('express')
var router = express.Router()
var account = require('../controllers/account_ctrl')
const middileware = require('../middileware')

router.post('/userRegistration', account.userRegistration);
router.get('/emailVerification/:token', account.emailVerification);
router.post('/userLogin', account.userLogin);

router.post('/forgotPassword', account.forgotPassword);
router.get('/resetPasswordVerification/:token', account.resetPasswordVerification);
router.post('/resetPassword', account.resetPassword);
router.post('/changePassword', middileware.checkAuthentication, account.changePassword);

router.post('/getAllUsers', middileware.checkAuthentication, account.getAllUsers);
router.get('/getUserById', middileware.checkAuthentication, account.getUserById);

router.put('/updateProfile', middileware.checkAuthentication, account.updateProfile);


module.exports = router;