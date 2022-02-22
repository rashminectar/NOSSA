const holidayController = require('../controllers/holiday_ctrl')
const middileware = require('../middileware')
const router = require('express').Router()

router.get('/', middileware.checkAuthentication, holidayController.getHoliday)
router.post('/add', middileware.checkAuthentication, middileware.checkAdminAuthentication, holidayController.addHoliday)
router.put('/edit', middileware.checkAuthentication, middileware.checkAdminAuthentication, holidayController.updateHoliday)
router.delete('/delete', middileware.checkAuthentication, middileware.checkAdminAuthentication, holidayController.deleteHoliday)
router.post('/import', middileware.checkAuthentication, middileware.checkAdminAuthentication, holidayController.importHoliday)

module.exports = router;