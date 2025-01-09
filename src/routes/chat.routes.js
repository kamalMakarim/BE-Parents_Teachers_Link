const chatController = require('../controllers/chat.controller');
const router = require('express').Router();
const auth = require('../middlewares/auth.middlewares');

router.post('/createChat', auth.authenticate, chatController.createChat);
router.get('/getChats', auth.authenticate, chatController.getChats);
router.delete('/deleteChat', auth.authenticate, chatController.deleteChat);

module.exports = router;