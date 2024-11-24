// src/server.js
const express = require('express');
const cors = require('cors');
const path = require('path')
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const formRoutes = require('./routes/formRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Import admin routes
const errorHandler = require('./middleware/errorHandler');
const helmet = require('helmet');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet())

// Route Sederhana
app.get('/', (req, res) => {
    res.send('Server untuk React.js berjalan!');
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/admin', adminRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(errorHandler); // Pastikan middleware ini ada dan berfungsi

// Menjalankan server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
