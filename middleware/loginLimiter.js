// loginLimiter.js (CommonJS)
const rateLimit = require('express-rate-limit');  // Pastikan tanda kurungnya benar

// Membatasi login rate
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 5, // Maksimal 5 permintaan
    message: 'Too many login attempts, please try again later.'
});

module.exports = loginLimiter;  // Pastikan mengekspor middleware menggunakan CommonJS
