const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid'); // Import UUID untuk menghasilkan nomor tiket
const prisma = new PrismaClient();

const submitForm = async (req, res) => {
    const { tanggal, pilihan_kendala, deskripsi } = req.body;
    const lampiran = req.file ? req.file.path : null; // Cek apakah file diterima

    console.log("Lampiran yang diterima:", lampiran); // Debug log untuk melihat apakah file diterima

    const NIK = req.user.NIK;

    try {
        const newForm = await prisma.form.create({
            data: {
                NIK: NIK,
                tanggal: new Date(tanggal),
                pilihan_kendala,
                deskripsi,
                lampiran, // Simpan path file
                status: "Menunggu",
            }
        });
        
        res.status(201).json({ message: 'Form berhasil dikirim', form: newForm });
    } catch (error) {
        console.error("Error creating form:", error);
        res.status(500).json({ error: 'Gagal mengirim form' });
    }
};

const getReports = async (req, res) => {
    const NIK = req.user.NIK; // Ambil NIK dari objek user yang terautentikasi

    try {
        // Menambahkan filter berdasarkan NIK untuk menampilkan hanya laporan milik pengguna yang sedang login
        const reports = await prisma.form.findMany({
            where: {
                NIK: NIK, // Filter berdasarkan NIK
            },
            include: {
                user: {
                    select: {
                        nama_lengkap: true,
                    },
                },
            },
        });

        // Format laporan agar mengembalikan nama lengkap pelapor dan lampiran
        const formattedReports = reports.map(report => ({
            ...report,
            nama_lengkap: report.user.nama_lengkap, // Tambahkan nama lengkap
            lampiran: report.lampiran, // Pastikan lampiran ada
        }));

        return res.json(formattedReports);
    } catch (error) {
        console.error("Error fetching reports:", error);
        return res.status(500).json({ error: 'Gagal mengambil laporan.' });
    }
};

const deleteReport = async (req, res) => {
    const { id } = req.params; // Ambil id dari parameter route

    try {
        const deletedReport = await prisma.form.delete({
            where: { id: Number(id) }, // Pastikan id dikonversi ke Number
        });

        res.status(200).json({ message: 'Laporan berhasil dihapus', deletedReport });
    } catch (error) {
        console.error("Error deleting report:", error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Laporan tidak ditemukan' });
        }
        res.status(500).json({ error: 'Gagal menghapus laporan' });
    }
};

const completeReport = async (req, res) => {
    const { id } = req.params; // Ambil id dari parameter route

    try {
        const updatedReport = await prisma.form.update({
            where: { id: Number(id) }, // Pastikan id dikonversi ke Number
            data: { status: 'completed' }, // Ubah status menjadi "completed"
        });

        res.status(200).json({ message: 'Laporan berhasil diselesaikan', updatedReport });
    } catch (error) {
        console.error("Error completing report:", error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Laporan tidak ditemukan' });
        }
        res.status(500).json({ error: 'Gagal menyelesaikan laporan' });
    }
};

module.exports = { submitForm, getReports, deleteReport, completeReport };
