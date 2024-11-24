const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Ambil token dari header

    if (!token) {
        return res.status(401).json({ error: 'Token is required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Token verification error:', err);
            return res.status(403).json({ error: 'Token is invalid' });
        }

        // Menyimpan decoded token di req.user untuk digunakan di route
        req.user = decoded; // Menyimpan seluruh decoded token
        req.userId = decoded.id; // Menyimpan userId ke req.userId
        next();
    });
};

module.exports = authMiddleware;
