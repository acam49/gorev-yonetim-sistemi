const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const userRepository = require('../repositories/userRepository');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

class UserService {
    constructor(userRepo = userRepository) {
        this.userRepository = userRepo;
    }

    _validatePassword(password) {
        if (!password || password.length < 6) {
            const error = new Error('Şifre en az 6 karakter olmalıdır.');
            error.status = 400;
            throw error;
        }
        if (!/[A-Z]/.test(password)) {
            const error = new Error('Şifre en az 1 büyük harf içermelidir.');
            error.status = 400;
            throw error;
        }
        if (!/[0-9]/.test(password)) {
            const error = new Error('Şifre en az 1 rakam içermelidir.');
            error.status = 400;
            throw error;
        }
    }

    async getAllUsers() {
        return await this.userRepository.findAll();
    }

    async registerUser(data) {
        const { fullName, tcNo, email, role, username } = data;

        if (!username || !email || !tcNo) {
            const error = new Error('Kullanıcı adı, e-posta ve TC zorunludur');
            error.status = 400;
            throw error;
        }

        const existingTC = await this.userRepository.findByTcNo(tcNo);
        if (existingTC) {
            const error = new Error('Bu TC Kimlik numarası zaten kayıtlı');
            error.status = 409;
            throw error;
        }

        const existingUsername = await this.userRepository.findByUsername(username);
        if (existingUsername) {
            const error = new Error('Bu kullanıcı adı zaten alınmış');
            error.status = 409;
            throw error;
        }

        const existingEmail = await this.userRepository.findByEmail(email);
        if (existingEmail) {
            const error = new Error('Bu e-posta adresi zaten kayıtlı');
            error.status = 409;
            throw error;
        }

        const temporaryPassword = crypto.randomBytes(4).toString('hex');
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

        const newUser = await this.userRepository.create({
            username,
            fullName,
            tcNo,
            email,
            role,
            password: hashedPassword,
            isFirstLogin: true
        });

        console.log(`\n--- YENİ PERSONEL EKLENDİ ---`);
        console.log(`Kullanıcı Adı : ${username}`);
        console.log(`Geçici Şifre  : ${temporaryPassword}\n`);

        const mailOptions = {
            from: `"Görev Yönetim Sistemi" <${process.env.SMTP_USER}>`,
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

        return {
            id: newUser.id,
            username: newUser.username,
            fullName: newUser.fullName
        };
    }

    async login(username, password) {
        const cleanUsername = (username || '').trim();
        const cleanPassword = (password || '');

        if (!cleanUsername || !cleanPassword) {
            const error = new Error('Kullanıcı adı ve şifre zorunludur');
            error.status = 400;
            throw error;
        }

        const user = await this.userRepository.findByUsername(cleanUsername);
        if (!user) {
            const error = new Error('Kullanıcı adı veya şifre hatalı');
            error.status = 401;
            throw error;
        }

        const passwordMatch = await bcrypt.compare(cleanPassword, user.password);
        if (!passwordMatch) {
            const error = new Error('Kullanıcı adı veya şifre hatalı');
            error.status = 401;
            throw error;
        }

        if (user.isFirstLogin) {
            return {
                requiresPasswordChange: true,
                userId: user.id,
                message: 'Güvenliğiniz için lütfen kalıcı şifrenizi belirleyin.'
            };
        }

        await this.userRepository.update(user.id, {
            isOnline: true,
            lastLogin: new Date()
        });

        const token = jwt.sign(
            { id: user.id, username: user.username, fullName: user.fullName, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        return {
            token,
            user: { id: user.id, username: user.username, fullName: user.fullName, role: user.role }
        };
    }

    async changeFirstPassword(userId, newPassword) {
        this._validatePassword(newPassword);

        const user = await this.userRepository.findById(userId);
        if (!user) {
            const error = new Error('Kullanıcı bulunamadı.');
            error.status = 404;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.userRepository.update(userId, {
            password: hashedPassword,
            isFirstLogin: false
        });

        return { message: 'Şifreniz başarıyla oluşturuldu. Şimdi giriş yapabilirsiniz.' };
    }

    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            const error = new Error('Kullanıcı bulunamadı.');
            error.status = 404;
            throw error;
        }

        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) {
            const error = new Error('Mevcut şifreniz hatalı.');
            error.status = 401;
            throw error;
        }

        this._validatePassword(newPassword);

        const hashedNew = await bcrypt.hash(newPassword, 10);
        await this.userRepository.update(userId, { password: hashedNew });

        return { message: 'Şifreniz başarıyla güncellendi.' };
    }

    async logout(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            const error = new Error('Kullanıcı bulunamadı');
            error.status = 404;
            throw error;
        }

        await this.userRepository.update(userId, {
            isOnline: false,
            lastLogout: new Date()
        });

        return { message: 'Çıkış yapıldı' };
    }

    async updateUser(id, data) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            const error = new Error('Personel bulunamadı');
            error.status = 404;
            throw error;
        }

        const updatePayload = {
            fullName: data.fullName || user.fullName,
            tcNo: data.tcNo || user.tcNo,
            email: data.email || user.email,
            role: data.role || user.role,
            username: data.username || user.username
        };

        try {
            await this.userRepository.update(id, updatePayload);
        } catch (err) {
            if (err.name === 'SequelizeUniqueConstraintError') {
                const error = new Error('Bu kullanıcı adı, TC veya e-posta zaten kayıtlı.');
                error.status = 409;
                throw error;
            }
            throw err;
        }

        const updatedUser = await this.userRepository.findById(id);
        return updatedUser;
    }

    async deleteUser(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            const error = new Error('Personel bulunamadı');
            error.status = 404;
            throw error;
        }

        const taskRepository = require('../repositories/taskRepository');
        await taskRepository.unassignUserTasks(id);

        await this.userRepository.delete(id);
        return { message: 'Personel sistemden silindi ve üzerindeki tüm görevler Genel görevlere çevrildi.' };
    }

    async seedAdmin() {
        const userCount = await this.userRepository.count();
        if (userCount === 0) {
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_DEFAULT_PASSWORD, 10);
            await this.userRepository.create({
                username: 'admin',
                fullName: 'Sistem Yoneticisi',
                email: 'admin@sistem.com',
                tcNo: '00000000000',
                password: hashedPassword,
                role: 'Admin',
                isFirstLogin: false
            });
            console.log('Kurumsal Admin oluşturuldu! Kullanıcı: admin');
        }
    }
}

module.exports = new UserService();
