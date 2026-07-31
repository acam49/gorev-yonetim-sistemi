const SystemLog = require('../models/SystemLog');
const User = require('../models/User');

class LogRepository {
    async findAll() {
        return await SystemLog.findAll({
            include: [{ model: User, as: 'user', attributes: ['username', 'fullName', 'role'] }],
            order: [['createdAt', 'DESC']]
        });
    }

    async findById(id) {
        return await SystemLog.findByPk(id);
    }

    async create(logData) {
        return await SystemLog.create(logData);
    }

    async delete(id) {
        const log = await SystemLog.findByPk(id);
        if (!log) return false;
        await log.destroy();
        return true;
    }
}

module.exports = new LogRepository();
