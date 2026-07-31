const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, requireManager } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

// Tüm personelleri listele (SADECE MÜDÜR/ADMIN)
router.get('/', verifyToken, requireManager, userController.getAllUsers);

// Yeni personel ekle (SADECE MÜDÜR/ADMIN)
router.post('/register', verifyToken, requireManager, userController.register);

// Giriş yap (AÇIK - BRUTE FORCE KORUMALI)
router.post('/login', loginLimiter, userController.login);

// Çıkış yap
router.put('/logout/:id', verifyToken, userController.logout);

// İlk giriş şifre değiştirme
router.post('/change-first-password', userController.changeFirstPassword);

// Kendi şifreni değiştir
router.put('/change-password', verifyToken, userController.changePassword);

// Personel bilgilerini güncelle (SADECE MÜDÜR/ADMIN)
router.put('/:id', verifyToken, requireManager, userController.updateUser);

// Personeli sil (SADECE MÜDÜR/ADMIN)
router.delete('/:id', verifyToken, requireManager, userController.deleteUser);

module.exports = router;