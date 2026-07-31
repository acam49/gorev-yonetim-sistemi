const userService = require('../services/userService');

class UserController {
    constructor(userSvc = userService) {
        this.userService = userSvc;
    }

    getAllUsers = async (req, res) => {
        try {
            const users = await this.userService.getAllUsers();
            res.status(200).json(users);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    };

    register = async (req, res) => {
        try {
            const user = await this.userService.registerUser(req.body);
            res.status(201).json({
                message: 'Personel kaydedildi ve geçici şifre e-postaya gönderildi.',
                user
            });
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    };

    login = async (req, res) => {
        try {
            const { username, password } = req.body;
            const result = await this.userService.login(username, password);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    };

    changeFirstPassword = async (req, res) => {
        try {
            const { userId, newPassword } = req.body;
            const result = await this.userService.changeFirstPassword(userId, newPassword);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    };

    changePassword = async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id;
            const result = await this.userService.changePassword(userId, currentPassword, newPassword);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    };

    logout = async (req, res) => {
        try {
            const { id } = req.params;
            const result = await this.userService.logout(id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    };

    updateUser = async (req, res) => {
        try {
            const { id } = req.params;
            const updatedUser = await this.userService.updateUser(id, req.body);
            res.status(200).json({ message: 'Personel bilgileri başarıyla güncellendi', user: updatedUser });
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    };

    deleteUser = async (req, res) => {
        try {
            const { id } = req.params;
            const result = await this.userService.deleteUser(id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    };
}

module.exports = new UserController();