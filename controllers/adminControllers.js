const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

// Login Admin berdasarkan username
const loginAdmin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await prisma.admin.findUnique({
            where: { username }
        });

        if (!admin) {
            return res.status(404).json({ error: 'Admin tidak ditemukan' });
        }

        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Password salah' });
        }

        const token = jwt.sign(
            { id: admin.id, username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login berhasil', token });
    } catch (error) {
        console.error('Error during admin login:', error);
        res.status(500).json({ error: 'Error during login', details: error.message });
    }
};

// Register Admin
const registerAdmin = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingAdmin = await prisma.admin.findFirst({
            where: {
                OR: [{ email }, { username }]
            }
        });

        if (existingAdmin) {
            if (existingAdmin.email === email) {
                return res.status(400).json({ error: 'Email sudah digunakan' });
            }
            if (existingAdmin.username === username) {
                return res.status(400).json({ error: 'Username sudah digunakan' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await prisma.admin.create({
            data: { username, email, password: hashedPassword }
        });

        const token = jwt.sign(
            { id: newAdmin.id, username: newAdmin.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(201).json({ message: 'Admin berhasil didaftarkan', token });

    } catch (error) {
        console.error('Error during admin registration:', error);
        if (error instanceof prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return res.status(400).json({ error: 'Email atau username sudah digunakan' });
            }
        }
        return res.status(500).json({ error: 'Gagal membuat akun. Silakan coba lagi.', details: error.message });
    }
};

const getAllReports = async (req, res) => {
    const { searchQuery } = req.query;  // Mengambil query parameter searchQuery (nama pelapor)

    try {
        // Menyusun query dasar untuk mengambil laporan
        const queryOptions = {
            include: {
                user: true, // Menyertakan data pengguna yang mengirim laporan
            },
        };

        if (searchQuery) {
            queryOptions.where = {
                user: {
                    nama_lengkap: {
                        // Pencarian nama pelapor yang case insensitive
                        contains: searchQuery, 
                        mode: 'insensitive',  // Mengabaikan case saat pencarian
                    },
                },
            };
        }

        // Mengambil laporan dari database menggunakan Prisma
        const reports = await prisma.form.findMany(queryOptions);

        res.status(200).json(reports);  // Mengirim laporan dengan data pengguna
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Error fetching reports', details: error.message });
    }
};

// Mengambil laporan berdasarkan ID (untuk admin)
const getReportById = async (req, res) => {
    const { id } = req.params;

    try {
        const report = await prisma.form.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: true,  // Mengambil data user terkait
            },
        });

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.status(200).json(report);
    } catch (error) {
        console.error('Error fetching report by ID:', error);
        res.status(500).json({ error: 'Error fetching report', details: error.message });
    }
};


// Menghapus laporan berdasarkan ID (untuk admin)
const deleteReport = async (req, res) => {
    const { id } = req.params;

    try {
        const report = await prisma.form.findUnique({
            where: { id: parseInt(id) }
        });

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        const deletedReport = await prisma.form.delete({
            where: { id: parseInt(id) }
        });
        res.status(200).json({ message: 'Report deleted successfully', deletedReport });
    } catch (error) {
        console.error('Error deleting report:', error);
        res.status(500).json({ error: 'Error deleting report', details: error.message });
    }
};

// Mengubah status laporan menjadi "selesai" (untuk admin)
const completeReport = async (req, res) => {
    const { id } = req.params;

    try {
        const report = await prisma.form.findUnique({
            where: { id: parseInt(id) }
        });

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        const updatedReport = await prisma.form.update({
            where: { id: parseInt(id) },
            data: { status: 'selesai' }
        });

        res.status(200).json({ message: 'Report marked as completed', updatedReport });
    } catch (error) {
        console.error('Error updating report status:', error);
        res.status(500).json({ error: 'Error updating report', details: error.message });
    }
};

// Mengubah status laporan
const updateReportStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Ditolak', 'Menunggu', 'Selesai'];

    try {
        // Debug log untuk melihat status yang diterima
        console.log('Received status:', status);

        // Mengecek apakah status yang diberikan valid
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const report = await prisma.form.findUnique({
            where: { id: parseInt(id) }
        });

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Update status
        const updatedReport = await prisma.form.update({
            where: { id: parseInt(id) },
            data: { status }
        });

        return res.status(200).json({ message: 'Status updated successfully', updatedReport });

    } catch (error) {
        console.error('Error updating status:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Mengambil laporan berdasarkan NIK pengguna (untuk pengguna)
const getUserReports = async (req, res) => {
    const { userId } = req.admin;  // ID admin yang terautentikasi

    try {
        const reports = await prisma.form.findMany({
            where: { userId: userId }
        });
        res.status(200).json(reports);
    } catch (error) {
        console.error('Error fetching user reports:', error);
        res.status(500).json({ error: 'Error fetching user reports', details: error.message });
    }
};

// Mengambil statistik tentang total user, total report, dan pending report
const getStatistics = async (req, res) => {
    try {
        const [
            totalReports,
            masalahTeknisReports,
            permintaanKendalaReports,
            permintaanPerubahanReports,
            masalahKeamananReports,
            pertanyaanInformasiReports,
            pengaduanReports,
            pendingReports,
            totalUsers,
        ] = await Promise.all([
            prisma.form.count(),
            prisma.form.count({ where: { pilihan_kendala: 'Masalah Teknis' } }),
            prisma.form.count({ where: { pilihan_kendala: 'Permintaan Kendala' } }),
            prisma.form.count({ where: { pilihan_kendala: 'Permintaan Perubahan' } }),
            prisma.form.count({ where: { pilihan_kendala: 'Masalah Keamanan' } }),
            prisma.form.count({ where: { pilihan_kendala: 'Pertanyaan Informasi' } }),
            prisma.form.count({ where: { pilihan_kendala: 'Pengaduan' } }),

            // Hitung jumlah laporan yang pending
            prisma.form.count({ where: { status: 'Menunggu' } }),

            // Hitung jumlah total pengguna
            prisma.user.count(),
        ]);

        // Set activeUsers to 0 as requested
        const activeUsers = 0;

        res.status(200).json({
            totalReports,
            masalahTeknisReports,
            permintaanKendalaReports,
            permintaanPerubahanReports,
            masalahKeamananReports,
            pertanyaanInformasiReports,
            pengaduanReports,
            activeUsers,
            pendingReports,
            totalUsers,
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({
            error: 'Error fetching statistics',
            details: error.message
        });
    }
};

module.exports = {
    loginAdmin,
    registerAdmin,
    getAllReports,
    getReportById,
    deleteReport,
    completeReport,
    getUserReports,
    getStatistics,
    updateReportStatus,
};
