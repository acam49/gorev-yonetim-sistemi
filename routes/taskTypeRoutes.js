const express = require('express');
const router = express.Router();
const taskTypeController = require('../controllers/taskTypeController');
const { verifyToken, requireManager } = require('../middleware/auth');

// Tüm görev türlerini listele
router.get('/', verifyToken, taskTypeController.getAllTypes);

// Yeni görev türü ekle (SADECE MÜDÜR/ADMIN)
router.post('/', verifyToken, requireManager, taskTypeController.createType);

// Görev türü sil (SADECE MÜDÜR/ADMIN)
router.delete('/:id', verifyToken, requireManager, taskTypeController.deleteType);

module.exports = router;