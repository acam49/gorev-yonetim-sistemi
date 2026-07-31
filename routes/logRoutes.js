const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { verifyToken, requireManager } = require('../middleware/auth');

// Tüm logları getirme rotası (SADECE MÜDÜR/ADMIN)
router.get('/', verifyToken, requireManager, logController.getAllLogs);

// Yeni log ekleme rotası
router.post('/', verifyToken, logController.createLog);

// Tek bir logu silme rotası (SADECE MÜDÜR/ADMIN)
router.delete('/:id', verifyToken, requireManager, logController.deleteLog);

module.exports = router;