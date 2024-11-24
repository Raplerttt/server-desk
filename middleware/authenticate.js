// src/middleware/authenticate.js
const jwt = require('jsonwebtoken');

const authenticateAdmin = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Ambil token dari header Authorization

    if (!token) {
        return res.status(401).json({ error: 'Token tidak ditemukan' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded; // Simpan data admin yang terautentikasi dalam request
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ error: 'Token tidak valid atau telah kedaluwarsa' });
    }
};

module.exports = { authenticateAdmin };
