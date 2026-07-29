const express = require('express');
const router = express.Router();
const TaskType = require('../models/TaskType');
const verifyToken = require('../middleware/auth');
const { requireManager } = require('../middleware/auth');

// Tüm görev türlerini listele (giriş yapan herkes görebilir — görev atarken lazım)
router.get('/', verifyToken, async (req, res) => {
    try {
        const types = await TaskType.findAll({ order: [['name', 'ASC']] });
        res.json(types);
    } catch (error) {
        res.status(500).json({ message: 'Görev türleri alınamadı.', error: error.message });
    }
});

// Yeni görev türü ekle (SADECE MÜDÜR/ADMIN)
router.post('/', verifyToken, requireManager, async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ message: 'Görev türü adı zorunludur.' });

        const existing = await TaskType.findOne({ where: { name: name.trim() } });
        if (existing) return res.status(409).json({ message: 'Bu görev türü zaten mevcut.' });

        const newType = await TaskType.create({ name: name.trim(), description });
        res.status(201).json(newType);
    } catch (error) {
        res.status(500).json({ message: 'Görev türü eklenemedi.', error: error.message });
    }
});

// Görev türü sil (SADECE MÜDÜR/ADMIN)
router.delete('/:id', verifyToken, requireManager, async (req, res) => {
    try {
        const type = await TaskType.findByPk(req.params.id);
        if (!type) return res.status(404).json({ message: 'Görev türü bulunamadı.' });
        await type.destroy();
        res.json({ message: 'Görev türü silindi.' });
    } catch (error) {
        res.status(500).json({ message: 'Görev türü silinemedi.', error: error.message });
    }
});

module.exports = router;