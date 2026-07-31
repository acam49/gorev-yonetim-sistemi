const TaskType = require('../models/TaskType');

class TaskTypeRepository {
    async findAll() {
        return await TaskType.findAll({ order: [['name', 'ASC']] });
    }

    async findByName(name) {
        return await TaskType.findOne({ where: { name } });
    }

    async findById(id) {
        return await TaskType.findByPk(id);
    }

    async create(typeData) {
        return await TaskType.create(typeData);
    }

    async delete(id) {
        const type = await TaskType.findByPk(id);
        if (!type) return false;
        await type.destroy();
        return true;
    }
}

module.exports = new TaskTypeRepository();
