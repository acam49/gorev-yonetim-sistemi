const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // 1. Önce HttpOnly Cookie kontrol et, yoksa Authorization header'a bak
    let token = req.cookies?.token;
    if (!token && req.header('Authorization')) {
        token = req.header('Authorization').replace('Bearer ', '');
    }

    if (!token) {
        return res.status(401).json({ message: 'Erişim reddedildi. Önce giriş yapmalısınız.' });
    }

    try {
        const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verifiedToken;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Geçersiz veya süresi dolmuş oturum bileti.' });
    }
};

const requireManager = (req, res, next) => {
    const role = (req.user?.role || '').trim().toLocaleLowerCase('tr-TR');
    if (role !== 'müdür' && role !== 'admin') {
        return res.status(403).json({ message: 'Bu işlem için Müdür veya Admin yetkisi gereklidir.' });
    }
    next();
};

module.exports = { verifyToken, requireManager };