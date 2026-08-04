const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Sunucu içi bir hata oluştu.';

    if (status === 500) {
        logger.error(`[SUNUCU HATASI] ${req.method} ${req.url}: ${err.message}`, { stack: err.stack });
    } else {
        logger.warn(`[API UYARI] ${req.method} ${req.url}: ${err.message}`);
    }

    res.status(status).json({
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;
