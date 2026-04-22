// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Amikor valaki POST kérést küld a /login-ra, futtasd le a login függvényt!
router.post('/login', authController.login);

module.exports = router;