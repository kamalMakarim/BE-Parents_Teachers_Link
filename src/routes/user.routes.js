const userControllers = require('../controllers/user.controllers');
const router = require('express').Router();
const auth = require('../middlewares/auth.middlewares');
//router.post('/add', auth.authenticate, auth.isAdmin,userControllers.addUser);
router.post('/add', userControllers.addUser);
module.exports = router;

