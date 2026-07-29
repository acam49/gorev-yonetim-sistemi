const express = require('express');
const router = express.Router();
const SystemLog = require('../models/SystemLog');
const User = require('../models/User');
const verifyToken = require('../middleware/auth');
const { requireManager } = require('../middleware/auth');

// Tüm logları getirme rotası (SADECE MÜDÜR/ADMIN)
router.get('/', verifyToken, requireManager, async (req, res) => {
    try {
        const logs = await SystemLog.findAll({
            include: [{ model: User, as: 'user', attributes: ['username', 'fullName', 'role'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(logs);
    } catch (error) {
        console.error("Loglar çekilirken hata:", error);
        res.status(500).json({ message: 'Loglar alınırken hata oluştu.' });
    }
});

// Yeni log ekleme rotası (giriş yapmış herkes kendi işlemini loglayabilir)
router.post('/', verifyToken, async (req, res) => {
    try {
        const { userId, action, details, actorName, actorRole } = req.body;

        let resolvedName = actorName;
        let resolvedRole = actorRole;
        if ((!resolvedName || !resolvedRole) && userId) {
            const actingUser = await User.findByPk(userId);
            if (actingUser) {
                resolvedName = resolvedName || actingUser.fullName || actingUser.username;
                resolvedRole = resolvedRole || actingUser.role;
            }
        }

        const newLog = await SystemLog.create({
            userId,
            action,
            details,
            actorName: resolvedName || 'Bilinmeyen Kullanıcı',
            actorRole: resolvedRole || '-'
        });
        res.status(201).json(newLog);
    } catch (error) {
        console.error("Log eklenirken hata:", error);
        res.status(500).json({ message: 'Log kaydedilemedi.' });
    }
});

// Tek bir logu silme rotası (SADECE MÜDÜR/ADMIN)
router.delete('/:id', verifyToken, requireManager, async (req, res) => {
    try {
        const { id } = req.params;
        const log = await SystemLog.findByPk(id);

        if (!log) {
            return res.status(404).json({ message: 'Log kaydı bulunamadı.' });
        }

        await log.destroy();
        res.status(200).json({ message: 'Log kaydı silindi.' });
    } catch (error) {
        console.error("Log silinirken hata:", error);
        res.status(500).json({ message: 'Log silinemedi.' });
    }
});

module.exports = router;