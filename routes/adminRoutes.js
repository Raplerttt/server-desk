// src/routes/adminRoutes.js
const express = require('express');
const { loginAdmin, registerAdmin, getAllReports, getReportById, deleteReport, completeReport, getStatistics, updateReportStatus } = require('../controllers/adminControllers');
const { authenticateAdmin } = require('../middleware/authenticate');  // pastikan middleware ini benar
const { adminMiddleware } = require('../middleware/adminMiddleware');  // pastikan adminMiddleware berfungsi untuk validasi hak akses
const { param } = require('express-validator');
const handleValidationError = require('../middleware/handleValidationError'); 

const router = express.Router();

// Validasi ID laporan
const validateReportId = [
    param('id').isInt().withMessage('ID laporan harus berupa angka valid'),
    handleValidationError
];

// Rute untuk login dan register admin
router.post('/login', loginAdmin);
router.post('/register', registerAdmin);

// Rute untuk mengelola laporan oleh admin (autentikasi dan validasi hak akses)
router.get('/reports', authenticateAdmin, getAllReports);  // Mengambil semua laporan
router.patch('/reports/:id/status', authenticateAdmin, validateReportId, updateReportStatus);// Menyelesaikan laporan
router.get('/reports/:id', authenticateAdmin, validateReportId, getReportById); // Mengambil laporan berdasarkan ID
router.delete('/reports/:id', authenticateAdmin, validateReportId, deleteReport); // Menghapus laporan berdasarkan ID
router.patch('/reports/:id/complete', authenticateAdmin, validateReportId, completeReport); // Menyelesaikan laporan

// Rute untuk mendapatkan statistik hanya jika admin sudah terautentikasi
router.get('/statistics', authenticateAdmin, getStatistics);

module.exports = router;
