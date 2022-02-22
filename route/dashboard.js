const express = require('express');
const middileware = require('../middileware/index')
const router = express.Router()
const dashboard = require('../controllers/dashboard_ctrl')

router.get('/', middileware.checkAuthentication, dashboard.getDashboardData);
router.get('/getDashboardChartData', middileware.checkAuthentication, dashboard.getDashboardChartData);

module.exports = router