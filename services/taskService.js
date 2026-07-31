const taskRepository = require('../repositories/taskRepository');
const userRepository = require('../repositories/userRepository');
const logRepository = require('../repositories/logRepository');

const isManagerRole = (role) => {
    const r = (role || '').trim().toLocaleLowerCase('tr-TR');
    return r === 'müdür' || r === 'admin';
};

class TaskService {
    constructor(taskRepo = taskRepository, userRepo = userRepository, logRepo = logRepository) {
        this.taskRepository = taskRepo;
        this.userRepository = userRepo;
        this.logRepository = logRepo;
    }

    async _resolveActorName(currentUser) {
        if (currentUser.fullName) return currentUser.fullName;
        const dbUser = await this.userRepository.findById(currentUser.id);
        return dbUser ? (dbUser.fullName || dbUser.username) : currentUser.username;
    }

    async createTask(data, currentUser) {
        const { title, description, plannedDate, deadline, assignedToId, taskTypeId } = data;

        const parsedAssignedId = (assignedToId && String(assignedToId).trim() !== '') ? parseInt(assignedToId) : null;
        const parsedTaskTypeId = (taskTypeId && String(taskTypeId).trim() !== '') ? parseInt(taskTypeId) : null;

        const newTask = await this.taskRepository.create({
            title,
            description,
            plannedDate,
            deadline,
            assignedToId: parsedAssignedId,
            taskTypeId: parsedTaskTypeId
        });

        if (currentUser) {
            const actorName = await this._resolveActorName(currentUser);
            let assignedName = 'Genel (Herkese Açık)';
            if (parsedAssignedId) {
                const assignedUser = await this.userRepository.findById(parsedAssignedId);
                if (assignedUser) {
                    assignedName = assignedUser.fullName || assignedUser.username;
                }
            }
            await this.logRepository.create({
                userId: currentUser.id,
                actorName: actorName,
                actorRole: currentUser.role,
                action: 'Yeni Görev Atandı',
                details: `"${title}" başlıklı görev, ${assignedName} atanacak şekilde oluşturuldu.`
            });
        }

        return newTask;
    }

    async getAllTasks() {
        return await this.taskRepository.findAll();
    }

    async getTasksForUser(userId) {
        const { Op } = require('sequelize');
        return await this.taskRepository.findByUserId(userId, { status: { [Op.ne]: 'Tamamlandı' } });
    }

    async updateTask(id, updateData, currentUser) {
        const task = await this.taskRepository.findById(id);
        if (!task) {
            const error = new Error('Görev bulunamadı');
            error.status = 404;
            throw error;
        }

        const isOwner = currentUser && task.assignedToId === currentUser.id;
        const isUnassigned = !task.assignedToId;

        if (currentUser && !isManagerRole(currentUser.role) && !isOwner && !isUnassigned) {
            const error = new Error('Bu görevi güncelleme yetkiniz yok.');
            error.status = 403;
            throw error;
        }

        const payload = {};
        if (updateData.status !== undefined) payload.status = updateData.status;
        if (updateData.assignedToId !== undefined) {
            payload.assignedToId = (updateData.assignedToId && String(updateData.assignedToId).trim() !== '') 
                ? parseInt(updateData.assignedToId) 
                : null;
        }
        if (updateData.taskTypeId !== undefined) {
            payload.taskTypeId = (updateData.taskTypeId && String(updateData.taskTypeId).trim() !== '') 
                ? parseInt(updateData.taskTypeId) 
                : null;
        }

        const updatedTask = await this.taskRepository.update(id, payload);

        if (currentUser) {
            const actorName = await this._resolveActorName(currentUser);
            let actionText = 'Görev Durumu Güncellendi';
            let detailsText = `"${task.title}" başlıklı görevin durumu "${updatedTask.status}" olarak değiştirildi.`;

            if (isUnassigned && payload.assignedToId === currentUser.id) {
                actionText = 'Görev Üstlenildi';
                detailsText = `"${task.title}" başlıklı genel görev ${actorName} tarafından kendi üzerine alındı.`;
            }

            await this.logRepository.create({
                userId: currentUser.id,
                actorName: actorName,
                actorRole: currentUser.role,
                action: actionText,
                details: detailsText
            });
        }

        return updatedTask;
    }

    async deleteTask(id, currentUser) {
        const task = await this.taskRepository.findById(id);
        if (!task) {
            const error = new Error('Görev bulunamadı');
            error.status = 404;
            throw error;
        }

        const isManager = currentUser && isManagerRole(currentUser.role);
        const isOwner = currentUser && task.assignedToId === currentUser.id;

        if (task.status === 'Tamamlandı' && !isManager) {
            const error = new Error('Arşivdeki bir görevi sadece Müdür veya Admin silebilir.');
            error.status = 403;
            throw error;
        }
        if (!isManager && !isOwner) {
            const error = new Error('Bu görevi silme yetkiniz yok.');
            error.status = 403;
            throw error;
        }

        await this.taskRepository.delete(id);

        if (currentUser) {
            const actorName = await this._resolveActorName(currentUser);
            await this.logRepository.create({
                userId: currentUser.id,
                actorName: actorName,
                actorRole: currentUser.role,
                action: 'Görev Silindi',
                details: `"${task.title}" başlıklı görev sistemden tamamen silindi.`
            });
        }

        return { message: 'Görev başarıyla silindi' };
    }
}

module.exports = new TaskService();
