const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// ============================================================
// GMAIL AYARI — buraya kendi bilgilerini yaz
// Gmail Uygulama Şifresi almak için:
// myaccount.google.com → Güvenlik → 2 Adımlı Doğrulama →
// en altta "Uygulama şifreleri" → 16 haneli kodu buraya yaz
// ============================================================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'abdullaheta1@gmail.com',
        pass: 'snxn ddug asal cljk'
    }
});

// 0. Tüm kullanıcıları listele (SADECE MÜDÜR/ADMIN)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'fullName', 'tcNo', 'email', 'role', 'isOnline']
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Kullanıcılar getirilemedi', error: error.message });
    }
};

// 1. Yeni Personel Ekle — sistem şifreyi üretip maile gönderir
exports.register = async (req, res) => {
    try {
        const { fullName, tcNo, email, role, username } = req.body;

        if (!username || !email || !tcNo) {
            return res.status(400).json({ message: 'Kullanıcı adı, e-posta ve TC zorunludur' });
        }

        // Çakışma kontrolleri
        const existingTC = await User.findOne({ where: { tcNo } });
        if (existingTC) return res.status(409).json({ message: 'Bu TC Kimlik numarası zaten kayıtlı' });

        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) return res.status(409).json({ message: 'Bu kullanıcı adı zaten alınmış' });

        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) return res.status(409).json({ message: 'Bu e-posta adresi zaten kayıtlı' });

        // 8 haneli rastgele geçici şifre üret
        const temporaryPassword = crypto.randomBytes(4).toString('hex');
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

        const newUser = await User.create({
            username,
            fullName,
            tcNo,
            email,
            role,
            password: hashedPassword,
            isFirstLogin: true
        });

        // Terminale de yaz (mail gitmezse bile test edebilirsin)
        console.log(`\n--- YENİ PERSONEL EKLENDİ ---`);
        console.log(`Kullanıcı Adı : ${username}`);
        console.log(`Geçici Şifre  : ${temporaryPassword}\n`);

        // Personele mail gönder
        const mailOptions = {
            from: `"Görev Yönetim Sistemi" <abdullaheta1@gmail.com>`,
            to: email,
            subject: 'Hesabınız Oluşturuldu — Geçici Şifreniz',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border: 1px solid #eee; border-radius: 8px; padding: 32px;">
                    <h2 style="color: #c0273c;">Görev Yönetim Sistemi</h2>
                    <p>Merhaba <strong>${fullName}</strong>,</p>
                    <p>Sisteme kaydınız yapılmıştır. Aşağıdaki bilgilerle giriş yaparak kalıcı şifrenizi belirleyiniz.</p>
                    <table style="background:#f5f5f5; border-radius:6px; padding:16px; width:100%;">
                        <tr><td><strong>Kullanıcı Adı:</strong></td><td>${username}</td></tr>
                        <tr><td><strong>Geçici Şifre:</strong></td><td style="color:#c0273c; font-weight:bold; letter-spacing:2px;">${temporaryPassword}</td></tr>
                    </table>
                    <p style="margin-top:20px; color:#888; font-size:12px;">Bu şifre sadece ilk girişte kullanılabilir. Giriş yaptıktan sonra yeni şifrenizi belirlemeniz zorunludur.</p>
                </div>
            `
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) console.error('Mail gönderilemedi:', err.message);
            else console.log('Mail gönderildi:', info.response);
        });

        res.status(201).json({
            message: 'Personel kaydedildi ve geçici şifre e-postaya gönderildi.',
            user: { id: newUser.id, username: newUser.username, fullName: newUser.fullName }
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Bu kullanıcı adı, TC veya e-posta zaten kayıtlı.' });
        }
        res.status(500).json({ message: 'Kayıt sırasında hata oluştu', error: error.message });
    }
};

// 2. Giriş Yap
exports.login = async (req, res) => {
    try {
        let { username, password } = req.body;

        // Başta/sonda boşluk varsa temizle, sadece boşluktan oluşuyorsa reddet
        username = (username || '').trim();
        password = (password || '');

        if (!username || !password) {
            return res.status(400).json({ message: 'Kullanıcı adı ve şifre zorunludur' });
        }

        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ message: 'Kullanıcı adı veya şifre hatalı' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Kullanıcı adı veya şifre hatalı' });
        }

        // İlk giriş kontrolü — token vermeden şifre değiştirme ekranına yönlendir
        if (user.isFirstLogin) {
            return res.status(200).json({
                message: 'Güvenliğiniz için lütfen kalıcı şifrenizi belirleyin.',
                requiresPasswordChange: true,
                userId: user.id
            });
        }

        user.isOnline = true;
        user.lastLogin = new Date();
        await user.save();

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            'GIZLI_ANAHTAR_123',
            { expiresIn: '8h' }
        );

        res.status(200).json({
            message: 'Giriş başarılı',
            token,
            user: { id: user.id, username: user.username, fullName: user.fullName, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: 'Giriş sırasında hata oluştu', error: error.message });
    }
};

// 2.5 İlk girişte kalıcı şifre belirleme
exports.changeFirstPassword = async (req, res) => {
    try {
        const { userId, newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır.' });
        }
        if (!/[A-Z]/.test(newPassword)) {
            return res.status(400).json({ message: 'Şifre en az 1 büyük harf içermelidir.' });
        }
        if (!/[0-9]/.test(newPassword)) {
            return res.status(400).json({ message: 'Şifre en az 1 rakam içermelidir.' });
        }

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

        user.password = await bcrypt.hash(newPassword, 10);
        user.isFirstLogin = false; // Bir daha bu ekrana düşmeyecek
        await user.save();

        res.status(200).json({ message: 'Şifreniz başarıyla oluşturuldu. Şimdi giriş yapabilirsiniz.' });
    } catch (error) {
        res.status(500).json({ message: 'Şifre güncellenirken hata oluştu', error: error.message });
    }
};

// 2.7 Kendi Şifresini Değiştirme (sadece giriş yapan kişi kendinkini değiştirebilir)
exports.changePassword = async (req, res) => {
    try {
        console.log('\n====== changePassword BAŞLADI ======');
        
        const { currentPassword, newPassword } = req.body;
        console.log('[1] Body alındı - currentPassword var mı:', !!currentPassword, '| newPassword var mı:', !!newPassword);

        const userId = req.user.id;
        console.log('[2] Token dan gelen userId:', userId, '| tipi:', typeof userId);

        const user = await User.findByPk(userId);
        console.log('[3] Kullanıcı bulundu mu:', !!user, user ? '| email: ' + user.email : '');
        if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        console.log('[4] Mevcut şifre eşleşiyor mu:', passwordMatch);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Mevcut şifreniz hatalı.' });
        }

        if (!newPassword || newPassword.length < 6) {
            console.log('[5] HATA: Şifre çok kısa');
            return res.status(400).json({ message: 'Yeni şifre en az 6 karakter olmalıdır.' });
        }
        if (!/[A-Z]/.test(newPassword)) {
            console.log('[5] HATA: Büyük harf yok');
            return res.status(400).json({ message: 'Yeni şifre en az 1 büyük harf içermelidir.' });
        }
        if (!/[0-9]/.test(newPassword)) {
            console.log('[5] HATA: Rakam yok');
            return res.status(400).json({ message: 'Yeni şifre en az 1 rakam içermelidir.' });
        }
        console.log('[5] Şifre kuralları geçti');

        const hashedNew = await bcrypt.hash(newPassword, 10);
        console.log('[6] Yeni şifre hashlendi');

        const parsedId = parseInt(userId);
        console.log('[7] UPDATE çalışıyor - id:', parsedId, '| tipi:', typeof parsedId);
        
        const [updatedCount] = await User.update(
            { password: hashedNew },
            { where: { id: parsedId } }
        );
        console.log('[8] UPDATE tamamlandı - etkilenen satır:', updatedCount);

        if (updatedCount === 0) {
            console.log('[8] HATA: Hiç satır güncellenmedi!');
            return res.status(404).json({ message: 'Güncelleme başarısız, kullanıcı bulunamadı.' });
        }

        console.log('[9] Şifre başarıyla güncellendi!');
        console.log('====== changePassword BİTTİ ======\n');
        res.status(200).json({ message: 'Şifreniz başarıyla güncellendi.' });

    } catch (error) {
        console.error('\n====== changePassword KRİTİK HATA ======');
        console.error('Hata tipi    :', error.name);
        console.error('Hata mesajı  :', error.message);
        console.error('Sequelize adı:', error.original?.message || 'yok');
        console.error('Stack        :', error.stack);
        console.error('==========================================\n');
        res.status(500).json({ message: 'Şifre güncellenirken hata oluştu.', error: error.message });
    }
};

// 3. Çıkış Yap
exports.logout = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });

        user.isOnline = false;
        user.lastLogout = new Date();
        await user.save();

        res.status(200).json({ message: 'Çıkış yapıldı' });
    } catch (error) {
        res.status(500).json({ message: 'Çıkış sırasında hata oluştu', error: error.message });
    }
};

// 4. Personel Bilgilerini Güncelle (SADECE MÜDÜR/ADMIN)
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, tcNo, email, role, username } = req.body;

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'Personel bulunamadı' });

        user.fullName  = fullName  || user.fullName;
        user.tcNo      = tcNo      || user.tcNo;
        user.email     = email     || user.email;
        user.role      = role      || user.role;
        user.username  = username  || user.username;

        await user.save();

        res.status(200).json({ message: 'Personel bilgileri başarıyla güncellendi', user });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Bu kullanıcı adı, TC veya e-posta zaten kayıtlı.' });
        }
        res.status(500).json({ message: 'Güncelleme sırasında hata oluştu', error: error.message });
    }
};

// 5. Personeli Sil (SADECE MÜDÜR/ADMIN)
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) return res.status(404).json({ message: 'Personel bulunamadı' });

        await user.destroy();
        res.status(200).json({ message: 'Personel sistemden başarıyla silindi' });
    } catch (error) {
        res.status(500).json({ message: 'Silme işlemi sırasında hata oluştu', error: error.message });
    }
};