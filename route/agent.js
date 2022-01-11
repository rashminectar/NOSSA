const express = require('express');
const middileware = require('../middileware')
const router = express.Router()
const agent = require('../controllers/agent_ctrl')

router.get('/', agent.getAllAgent);
router.post('/add', middileware.checkAuthentication, agent.create);
router.put('/edit', middileware.checkAuthentication, agent.create);
router.delete('/delete', middileware.checkAuthentication, agent.delete);
router.get('/exportReport', agent.exportReport);


module.exports = router