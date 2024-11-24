const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

const createUser = async (req, res) => {
    const { NIK, nama_lengkap, email, username, password } = req.body;

    try {
        await checkUserExists(NIK, username);

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = await prisma.user.create({
            data: { NIK, nama_lengkap, email, username, password: hashedPassword }
        });

        res.status(201).json({
            message: 'User created successfully',
            user: { NIK, nama_lengkap, email, username }
        });
    } catch (error) {
        handleError(res, error, "Error creating user");
    }
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid password' });

        const token = jwt.sign(
            { id: user.id, NIK: user.NIK, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        handleError(res, error, "Login error");
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json(users);
    } catch (error) {
        handleError(res, error, "Error fetching users");
    }
};

const getUserProfile = async (req, res) => {
    const userId = req.userId;

    if (!userId) {
        return res.status(400).json({ error: "User ID is missing" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { NIK: true, nama_lengkap: true, email: true, username: true }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ user });
    } catch (error) {
        handleError(res, error, "Error fetching user profile");
    }
};

// Fungsi untuk mengupdate email dan username pengguna
const updateUserProfile = async (req, res) => {
    const { email, username } = req.body;
    const userId = req.userId;

    if (!userId) {
        return res.status(400).json({ error: "User ID is missing" });
    }

    try {
        // Cek apakah username sudah ada
        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser && existingUser.id !== userId) {
            return res.status(400).json({ error: "Username sudah terdaftar" });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { email, username },
        });

        res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        handleError(res, error, "Error updating user profile");
    }
};

// Helper function untuk memeriksa keberadaan pengguna
const checkUserExists = async (NIK, username) => {
    const existingNIK = await prisma.user.findUnique({ where: { NIK } });
    if (existingNIK) throw new Error("NIK sudah terdaftar");

    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) throw new Error("Username sudah terdaftar");
};

// Fungsi untuk menangani error
const handleError = (res, error, message) => {
    console.error(message, error);
    res.status(500).json({ error: message, details: error.message });
};

module.exports = { createUser, loginUser, getAllUsers, getUserProfile, updateUserProfile };
