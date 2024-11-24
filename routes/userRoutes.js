const express = require('express');
const { createUser, loginUser, getAllUsers, getUserProfile, updateUserProfile } = require('../controllers/userControllers');
const authMiddleware = require('../middleware/authMiddleware');
const { validateUserRegistration, validateUserLogin, handleValidationErrors } = require('../middleware/validateUser');
const loginLimiter = require('../middleware/loginLimiter')

const router = express.Router();

router.post('/daftar', validateUserRegistration, handleValidationErrors, createUser);
router.post('/login', loginLimiter, validateUserLogin, handleValidationErrors, loginUser);
router.get('/', authMiddleware, getAllUsers);
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);
router.get('/protected', authMiddleware, (req, res) => {
    res.status(200).json({ message: 'Access granted', user: req.user });
});

module.exports = router;
