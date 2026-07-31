const taskTypeRepository = require('../repositories/taskTypeRepository');

class TaskTypeService {
    constructor(typeRepo = taskTypeRepository) {
        this.taskTypeRepository = typeRepo;
    }

    async getAllTypes() {
        return await this.taskTypeRepository.findAll();
    }

    async createType(data) {
        const { name, description } = data;
        const cleanName = (name || '').trim();

        if (!cleanName) {
            const error = new Error('Görev türü adı zorunludur.');
            error.status = 400;
            throw error;
        }

        const existing = await this.taskTypeRepository.findByName(cleanName);
        if (existing) {
            const error = new Error('Bu görev türü zaten mevcut.');
            error.status = 409;
            throw error;
        }

        return await this.taskTypeRepository.create({ name: cleanName, description });
    }

    async deleteType(id) {
        const success = await this.taskTypeRepository.delete(id);
        if (!success) {
            const error = new Error('Görev türü bulunamadı.');
            error.status = 404;
            throw error;
        }
        return { message: 'Görev türü silindi.' };
    }
}

module.exports = new TaskTypeService();
