// src/middleware/adminMiddleware.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware untuk memeriksa apakah pengguna adalah admin
const adminMiddleware = async (req, res, next) => {
    const { userId } = req; // Mendapatkan userId dari token yang sudah diverifikasi sebelumnya

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin only' });
        }

        req.user = user; // Menambahkan user ke request untuk digunakan di route selanjutnya
        next(); // Lanjutkan ke route berikutnya jika pengguna adalah admin
    } catch (error) {
        console.error(error); // Log error untuk debugging
        res.status(500).json({ error: 'Error checking admin privileges', details: error.message });
    }
};

module.exports = { adminMiddleware };
