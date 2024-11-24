const validatePassword = (req, res, next) => {
    const { password } = req.body;

    // Cek apakah password memenuhi syarat (campuran huruf dan angka)
    const passwordRegex = /^(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$/; // Minimal 8 karakter, harus ada huruf dan angka

    if (!passwordRegex.test(password)) {
        return res.status(400).json({ error: 'Password harus minimal 8 karakter dan mengandung huruf serta angka.' });
    }

    next(); // Lanjutkan ke middleware atau route berikutnya jika valid
};

module.exports = validatePassword;
