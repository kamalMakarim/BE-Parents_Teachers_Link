const userControllers = require('../controllers/user.controllers');
const router = require('express').Router();
const auth = require('../middlewares/auth.middlewares');
router.post('/add',auth.authenticate, auth.isAdmin,userControllers.addUser);
router.put('/update-password', auth.authenticate, userControllers.updatePasswordByUser);
router.put('/update-password-admin', auth.authenticate, auth.isAdmin, userControllers.updatePasswordByAdmin);
router.put('/update-display-name', auth.authenticate, userControllers.updateDisplayName);   
router.delete('/delete/:username', auth.authenticate, auth.isAdmin, userControllers.deleteUser);


module.exports = router;

