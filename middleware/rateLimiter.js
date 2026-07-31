const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika penceresi
    max: 3, // IP başına 15 dakikada en fazla 10 deneme hakkı
    message: { message: 'Çok fazla hatalı giriş denemesi yapıldı. Güvenliğiniz için lütfen 15 dakika sonra tekrar deneyiniz.' },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = { loginLimiter };
