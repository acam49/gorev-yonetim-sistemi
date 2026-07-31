const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Erişim reddedildi. Önce giriş yapmalısınız.' });
    }

    try {
        const verifiedToken = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
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