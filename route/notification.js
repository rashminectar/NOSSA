const express = require('express');
const middileware = require('../middileware/index')
const router = express.Router()
const notification = require('../controllers/notification_ctrl')

router.get('/', middileware.checkAuthentication, notification.getNotification);
router.post('/add', middileware.checkAuthentication, middileware.checkAdminAuthentication, notification.addNotification);
router.put('/edit', middileware.checkAuthentication, middileware.checkAdminAuthentication, notification.editNotification);
router.delete('/delete', middileware.checkAuthentication, middileware.checkAdminAuthentication, notification.deleteNotification);

router.get('/getUserNotification', middileware.checkAuthentication, notification.getUserNotification);
router.post('/addUserNotification', middileware.checkAuthentication, notification.addUserNotification);

module.exports = router