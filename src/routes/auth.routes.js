const authControllers = require('../controllers/auth.controllers');
const express = require('express');
const router = express.Router();

router.post('/login', authControllers.login);

module.exports = router;