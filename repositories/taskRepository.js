const Task = require('../models/Task');
const User = require('../models/User');
const TaskType = require('../models/TaskType');
const { Op } = require('sequelize');

class TaskRepository {
    async findAll() {
        return await Task.findAll({
            include: [
                { model: User, as: 'assignedTo', attributes: ['id', 'username', 'fullName', 'role'] },
                { model: TaskType, as: 'taskType', attributes: ['id', 'name'] }
            ],
            order: [['createdAt', 'DESC']]
        });
    }

    async findById(id) {
        return await Task.findByPk(id, {
            include: [
                { model: User, as: 'assignedTo', attributes: ['id', 'username', 'fullName', 'role'] },
                { model: TaskType, as: 'taskType', attributes: ['id', 'name'] }
            ]
        });
    }

    async findByUserId(userId, filter = {}) {
        const whereClause = { assignedToId: userId, ...filter };
        return await Task.findAll({
            where: whereClause,
            include: [
                { model: User, as: 'assignedTo', attributes: ['id', 'username', 'fullName', 'role'] },
                { model: TaskType, as: 'taskType', attributes: ['id', 'name'] }
            ],
            order: [['deadline', 'ASC']]
        });
    }

    async create(taskData) {
        return await Task.create(taskData);
    }

    async update(id, taskData) {
        const task = await Task.findByPk(id);
        if (!task) return null;
        await task.update(taskData);
        return await this.findById(id);
    }

    async delete(id) {
        const task = await Task.findByPk(id);
        if (!task) return false;
        await task.destroy();
        return true;
    }

    async unassignUserTasks(userId) {
        return await Task.update({ assignedToId: null }, { where: { assignedToId: userId } });
    }
}

module.exports = new TaskRepository();
