const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const verifyToken = require('../middleware/auth');
const { requireManager } = require('../middleware/auth');

// Tüm personelleri listele (SADECE MÜDÜR/ADMIN)
router.get('/', verifyToken, requireManager, userController.getAllUsers);

// Yeni personel ekle (SADECE MÜDÜR/ADMIN — artık giriş yapmadan kayıt olunamaz)
router.post('/register', verifyToken, requireManager, userController.register);

// Giriş yap (AÇIK — henüz elde token yok, olması mantıksız)
router.post('/login', userController.login);

// Çıkış yap (giriş yapmış herkes kendini çıkarabilir)
router.put('/logout/:id', verifyToken, userController.logout);

// Sabit path'ler (:id gibi dinamik pattern'lardan ÖNCE tanımlanmalı!
// Aksi halde Express /change-password'ü bir id olarak algılar.
router.post('/change-first-password', userController.changeFirstPassword);

// Kendi şifreni değiştir (token zorunlu)
router.put('/change-password', verifyToken, userController.changePassword);

// Personel bilgilerini güncelle (SADECE MÜDÜR/ADMIN) — dinamik :id en sona
router.put('/:id', verifyToken, requireManager, userController.updateUser);

// Personeli sil (SADECE MÜDÜR/ADMIN)
router.delete('/:id', verifyToken, requireManager, userController.deleteUser);

module.exports = router;