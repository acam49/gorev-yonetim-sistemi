const validateUserRegister = (req, res, next) => {
    const { username, email, tcNo, fullName } = req.body;

    if (!username || typeof username !== 'string' || username.trim() === '') {
        return res.status(400).json({ message: 'Geçerli bir kullanıcı adı zorunludur.' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Geçerli bir e-posta adresi zorunludur.' });
    }
    if (!tcNo || !/^\d{11}$/.test(String(tcNo).trim())) {
        return res.status(400).json({ message: 'TC Kimlik No 11 haneli rakamlardan oluşmalıdır.' });
    }
    if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
        return res.status(400).json({ message: 'Geçerli bir Ad Soyad zorunludur.' });
    }

    next();
};

const validateLogin = (req, res, next) => {
    const { username, password } = req.body;

    if (!username || String(username).trim() === '') {
        return res.status(400).json({ message: 'Kullanıcı adı boş bırakılamaz.' });
    }
    if (!password || String(password).trim() === '') {
        return res.status(400).json({ message: 'Şifre boş bırakılamaz.' });
    }

    next();
};

const validateCreateTask = (req, res, next) => {
    const { title, plannedDate, deadline } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ message: 'Görev başlığı zorunludur.' });
    }
    if (plannedDate && deadline && new Date(deadline) < new Date(plannedDate)) {
        return res.status(400).json({ message: 'Hedeflenen bitiş tarihi, planlanan başlama tarihinden önce olamaz.' });
    }

    next();
};

const validateChangePassword = (req, res, next) => {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır.' });
    }
    if (!/[A-Z]/.test(newPassword)) {
        return res.status(400).json({ message: 'Şifre en az 1 büyük harf içermelidir.' });
    }
    if (!/[0-9]/.test(newPassword)) {
        return res.status(400).json({ message: 'Şifre en az 1 rakam içermelidir.' });
    }

    next();
};

module.exports = {
    validateUserRegister,
    validateLogin,
    validateCreateTask,
    validateChangePassword
};
