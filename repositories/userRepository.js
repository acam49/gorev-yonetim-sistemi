const User = require('../models/User');

class UserRepository {
    async findAll() {
        return await User.findAll();
    }

    async findById(id) {
        return await User.findByPk(id);
    }

    async findByUsername(username) {
        return await User.findOne({ where: { username } });
    }

    async findByTcNo(tcNo) {
        return await User.findOne({ where: { tcNo } });
    }

    async findByEmail(email) {
        return await User.findOne({ where: { email } });
    }

    async create(userData) {
        return await User.create(userData);
    }

    async update(id, updateData) {
        return await User.update(updateData, { where: { id: parseInt(id) } });
    }

    async delete(id) {
        const user = await User.findByPk(id);
        if (!user) return false;
        await user.destroy();
        return true;
    }

    async count() {
        return await User.count();
    }
}

module.exports = new UserRepository();
