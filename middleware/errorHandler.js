const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log kesalahan di server
    res.status(500).json({ error: 'Internal server error' });
};

module.exports = errorHandler;