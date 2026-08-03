const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { verifyToken, requireManager } = require('../middleware/auth');
const { validateCreateTask } = require('../middleware/validator');

// Yeni görev oluşturma (SADECE MÜDÜR/ADMIN)
router.post('/', verifyToken, requireManager, validateCreateTask, taskController.createTask);

// Tüm görevleri listele
router.get('/', verifyToken, taskController.getTasks);

// Belirli bir kullanıcıya atanmış aktif görevler
router.get('/user/:userId', verifyToken, taskController.getTasksForUser);

// Görev güncelleme / Kendine al (Yetki kontrolü taskService içinde yapılır: Müdür, Görev Sahibi veya Sahipsiz Görev üstlenen)
router.put('/:id', verifyToken, taskController.updateTask);

// Görev silme (Yetki kontrolü taskService içinde yapılır: Müdür veya Görev Sahibi silebilir, Arşivdeki görevi sadece Müdür siler)
router.delete('/:id', verifyToken, taskController.deleteTask);

module.exports = router;