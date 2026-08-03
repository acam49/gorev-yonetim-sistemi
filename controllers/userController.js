const userService = require('../services/userService');

class UserController {
    constructor(userSvc = userService) {
        this.userService = userSvc;
    }

    getAllUsers = async (req, res, next) => {
        try {
            const users = await this.userService.getAllUsers();
            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    };

    register = async (req, res, next) => {
        try {
            const user = await this.userService.registerUser(req.body);
            res.status(201).json({
                message: 'Personel kaydedildi ve geçici şifre e-postaya gönderildi.',
                user
            });
        } catch (error) {
            next(error);
        }
    };

    login = async (req, res, next) => {
        try {
            const { username, password } = req.body;
            const result = await this.userService.login(username, password);
            if (result.token) {
                res.cookie('token', result.token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 8 * 60 * 60 * 1000
                });
            }
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    changeFirstPassword = async (req, res, next) => {
        try {
            const { userId, newPassword } = req.body;
            const result = await this.userService.changeFirstPassword(userId, newPassword);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    changePassword = async (req, res, next) => {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id;
            const result = await this.userService.changePassword(userId, currentPassword, newPassword);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    logout = async (req, res, next) => {
        try {
            const { id } = req.params;
            res.clearCookie('token');
            const result = await this.userService.logout(id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    updateUser = async (req, res, next) => {
        try {
            const { id } = req.params;
            const updatedUser = await this.userService.updateUser(id, req.body);
            res.status(200).json({ message: 'Personel bilgileri başarıyla güncellendi', user: updatedUser });
        } catch (error) {
            next(error);
        }
    };

    deleteUser = async (req, res, next) => {
        try {
            const { id } = req.params;
            const result = await this.userService.deleteUser(id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new UserController();