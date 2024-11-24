const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { submitForm, getReports, deleteReport, completeReport } = require('../controllers/formControllers');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Tentukan folder penyimpanan

const router = express.Router();

// Endpoint untuk mengirim form
// Menggunakan authMiddleware untuk memastikan pengguna terautentikasi
router.post('/submit', authMiddleware, upload.single('lampiran'), submitForm);

// Endpoint untuk mengambil laporan yang diajukan oleh pengguna (berdasarkan NIK pengguna yang login)
router.get('/reports', authMiddleware, getReports);

// Endpoint untuk mengambil laporan tertentu berdasarkan ID (berdasarkan NIK pengguna)
router.get('/reports/:id', authMiddleware, getReports); // Mengambil laporan berdasarkan ID

// Endpoint untuk menghapus laporan berdasarkan ID
router.delete('/reports/:id', authMiddleware, deleteReport); // Hapus laporan berdasarkan ID

// Endpoint untuk menyelesaikan laporan berdasarkan ID
router.patch('/reports/:id/complete', authMiddleware, completeReport); // Update status laporan menjadi "complete"

module.exports = router;
