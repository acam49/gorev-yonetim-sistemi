const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { verifyToken, requireManager } = require('../middleware/auth');

// Yeni görev oluşturma (SADECE MÜDÜR/ADMIN)
router.post('/', verifyToken, requireManager, taskController.createTask);

// Tüm görevleri listele
router.get('/', verifyToken, taskController.getTasks);

// Belirli bir kullanıcıya atanmış aktif görevler
router.get('/user/:userId', verifyToken, taskController.getTasksForUser);

// Görev güncelleme / Kendine al
router.put('/:id', verifyToken, taskController.updateTask);

// Görev silme
router.delete('/:id', verifyToken, taskController.deleteTask);

module.exports = router;