const logControllers = require('../controllers/log.controllers');
const router = require('express').Router();
const auth = require('../middlewares/auth.middlewares');

router.post('/add', auth.authenticate, auth.isTeacher, logControllers.createLog);
router.post('/addBidangStudy', auth.authenticate, auth.isTeacher, logControllers.createLogBidangStudy);
router.delete('/delete', auth.authenticate, auth.isTeacher, logControllers.deleteLog);
router.put('/update', auth.authenticate, auth.isTeacher, logControllers.updateLog);
router.post('/getLogOfstudent', auth.authenticate, logControllers.getLogOfStudent);
router.delete('/deleteAll', auth.authenticate, auth.isAdmin, logControllers.deleteAllLogs);

module.exports = router;