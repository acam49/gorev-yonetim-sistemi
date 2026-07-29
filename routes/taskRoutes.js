const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

const verifyToken = require('../middleware/auth');
const { requireManager } = require('../middleware/auth');

// Yeni görev oluşturma (SADECE MÜDÜR/ADMIN görev atayabilir)
router.post('/', verifyToken, requireManager, taskController.createTask);

// Tüm görevleri listele (giriş yapmış herkes görebilir)
router.get('/', verifyToken, taskController.getTasks);

// Belirli bir kullanıcıya atanmış aktif görevler (giriş yapmış herkes)
router.get('/user/:userId', verifyToken, taskController.getTasksForUser);

// Görev güncelleme: kimin güncelleyebileceği controller içinde kontrol ediliyor
router.put('/:id', verifyToken, taskController.updateTask);

// Görev silme: aynı şekilde yetki kontrolü controller içinde
router.delete('/:id', verifyToken, taskController.deleteTask);

module.exports = router;