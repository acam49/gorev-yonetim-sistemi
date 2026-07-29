const Task = require('../models/Task');
const User = require('../models/User');
const { Op } = require('sequelize');

const isManagerRole = (role) => {
    const r = (role || '').trim().toLocaleLowerCase('tr-TR');
    return r === 'müdür' || r === 'admin';
};

// 1. Yeni Görev Oluşturma Fonksiyonu (Tarihler ve atanan kullanıcı eklendi)
exports.createTask = async (req, res) => {
    try {
        const { title, description, plannedDate, deadline, assignedToId } = req.body; 
        
        const newTask = await Task.create({ 
            title, 
            description, 
            plannedDate, 
            deadline,
            assignedToId: (assignedToId && String(assignedToId).trim() !== '') ? parseInt(assignedToId) : null
        });
        
        res.status(201).json(newTask); 
    } catch (error) {
        res.status(500).json({ message: 'Görev oluşturulurken hata oluştu', error: error.message });
    }
};

// 2. Tüm Görevleri Listeleme Fonksiyonu
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.findAll({
            include: [{ model: User, as: 'assignedTo', attributes: ['id', 'username', 'fullName', 'role'] }],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Görevler getirilemedi', error });
    }
};

// 3. Görev Durumunu ve Atanan Kişiyi Güncelleme Fonksiyonu (Yetki kontrolü ve Kendine Al desteği)
exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, assignedToId } = req.body;
        
        const task = await Task.findByPk(id);
        if (!task) return res.status(404).json({ message: 'Görev bulunamadı' });

        const isOwner = task.assignedToId === req.user.id;
        const isUnassigned = !task.assignedToId; // Genel (sahipsiz) görev

        if (!isManagerRole(req.user.role) && !isOwner && !isUnassigned) {
            return res.status(403).json({ message: 'Bu görevi güncelleme yetkiniz yok.' });
        }
        
        if (status !== undefined) task.status = status;
        if (assignedToId !== undefined) {
            task.assignedToId = (assignedToId && String(assignedToId).trim() !== '') ? parseInt(assignedToId) : null;
        }

        await task.save();
        
        const updatedTask = await Task.findByPk(id, {
            include: [{ model: User, as: 'assignedTo', attributes: ['id', 'username', 'fullName', 'role'] }]
        });
        
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Görev güncellenemedi', error: error.message });
    }
};

// 4. Görev Silme Fonksiyonu (Yetki kontrolü eklendi)
exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findByPk(id);
        
        if (!task) return res.status(404).json({ message: 'Görev bulunamadı' });

        const isManager = isManagerRole(req.user.role);
        const isOwner = task.assignedToId === req.user.id;

        if (task.status === 'Tamamlandı' && !isManager) {
            return res.status(403).json({ message: 'Arşivdeki bir görevi sadece Müdür veya Admin silebilir.' });
        }
        if (!isManager && !isOwner) {
            return res.status(403).json({ message: 'Bu görevi silme yetkiniz yok.' });
        }
        
        await task.destroy();
        res.status(200).json({ message: 'Görev başarıyla silindi' });
    } catch (error) {
        res.status(500).json({ message: 'Görev silinemedi', error: error.message });
    }
};

// 5. Bir kullanıcıya atanmış aktif (tamamlanmamış) görevlerin tüm detaylarını döndürür
exports.getTasksForUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const tasks = await Task.findAll({
            where: {
                assignedToId: userId,
                status: { [Op.ne]: 'Tamamlandı' }
            },
            include: [{ model: User, as: 'assignedTo', attributes: ['id', 'username', 'fullName', 'role'] }],
            order: [['deadline', 'ASC']]
        });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Görevler getirilemedi', error: error.message });
    }
};