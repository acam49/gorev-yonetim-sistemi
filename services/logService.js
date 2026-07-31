const logRepository = require('../repositories/logRepository');
const userRepository = require('../repositories/userRepository');

class LogService {
    constructor(logRepo = logRepository, userRepo = userRepository) {
        this.logRepository = logRepo;
        this.userRepository = userRepo;
    }

    async getAllLogs() {
        return await this.logRepository.findAll();
    }

    async createLog(data) {
        const { userId, action, details, actorName, actorRole } = data;

        let resolvedName = actorName;
        let resolvedRole = actorRole;

        if ((!resolvedName || !resolvedRole) && userId) {
            const actingUser = await this.userRepository.findById(userId);
            if (actingUser) {
                resolvedName = resolvedName || actingUser.fullName || actingUser.username;
                resolvedRole = resolvedRole || actingUser.role;
            }
        }

        return await this.logRepository.create({
            userId,
            action,
            details,
            actorName: resolvedName || 'Bilinmeyen Kullanıcı',
            actorRole: resolvedRole || '-'
        });
    }

    async deleteLog(id) {
        const success = await this.logRepository.delete(id);
        if (!success) {
            const error = new Error('Log kaydı bulunamadı.');
            error.status = 404;
            throw error;
        }
        return { message: 'Log kaydı silindi.' };
    }
}

module.exports = new LogService();
