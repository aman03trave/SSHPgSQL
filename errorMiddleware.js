function errorHandler(err, req, res, next) {
    console.error('Error:', err.message);
    res.status(500).json({ status: false, message: err.message || 'Internal Server Error' });
}

export default errorHandler;