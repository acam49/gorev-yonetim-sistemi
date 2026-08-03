const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Sunucu içi bir hata oluştu.';

    if (status === 500) {
        console.error(`[SUNUCU HATASI] ${req.method} ${req.url}:`, err);
    }

    res.status(status).json({
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;
