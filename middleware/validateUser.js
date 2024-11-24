const { body, validationResult } = require('express-validator');

// Middleware untuk validasi pendaftaran pengguna
const validateUserRegistration = [
    body('NIK').notEmpty().withMessage('NIK is required'),
    body('nama_lengkap').notEmpty().withMessage('Nama lengkap is required'),
    body('email').isEmail().withMessage('Email is invalid'),
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
];

// Middleware untuk validasi login pengguna
const validateUserLogin = [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
];

// Middleware untuk memeriksa hasil validasi
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = { validateUserRegistration, validateUserLogin, handleValidationErrors };
