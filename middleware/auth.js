const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // 1. Gelen isteğin başlığından (header) token'ı al
    const token = req.header('Authorization');

    // 2. Token hiç yoksa kapıdan çevir
    if (!token) {
        return res.status(401).json({ message: 'Erişim reddedildi. Önce giriş yapmalısınız.' });
    }

    try {
        // 3. Token'ın başındaki "Bearer " kelimesini temizle ve bileti doğrula
        const verifiedToken = jwt.verify(token.replace('Bearer ', ''), 'GIZLI_ANAHTAR_123');

        // 4. Doğrulanmış kullanıcı bilgilerini isteğin (req) içine ekle
        req.user = verifiedToken;

        // 5. Kapıyı aç ve işlemin devam etmesine izin ver
        next();
    } catch (error) {
        res.status(400).json({ message: 'Geçersiz veya süresi dolmuş oturum bileti.' });
    }
};

// SADECE Müdür veya Admin rolündeki kullanıcıların geçmesine izin verir.
// DİKKAT: Bu her zaman verifyToken'dan SONRA route'a eklenmeli, çünkü
// req.user'ın dolu olması (yani önce token doğrulanmış olması) gerekir.
const requireManager = (req, res, next) => {
    const role = (req.user?.role || '').trim().toLocaleLowerCase('tr-TR');
    if (role !== 'müdür' && role !== 'admin') {
        return res.status(403).json({ message: 'Bu işlem için Müdür veya Admin yetkisi gereklidir.' });
    }
    next();
};

module.exports = verifyToken;
module.exports.requireManager = requireManager;