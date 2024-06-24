const logControllers = require('../controllers/log.controllers');
const router = require('express').Router();
const auth = require('../middlewares/auth.middlewares');

router.post('/add', auth.authenticate, auth.isTeacher, logControllers.createLog);
router.delete('/delete', auth.authenticate, auth.isTeacher, logControllers.deleteLog);
router.put('/update', auth.authenticate, auth.isTeacher, logControllers.updateLog);

module.exports = router;