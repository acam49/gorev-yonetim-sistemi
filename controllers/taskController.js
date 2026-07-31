const taskService = require('../services/taskService');

class TaskController {
    constructor(taskSvc = taskService) {
        this.taskService = taskSvc;
    }

    createTask = async (req, res) => {
        try {
            const newTask = await this.taskService.createTask(req.body, req.user);
            res.status(201).json(newTask);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    };

    getTasks = async (req, res) => {
        try {
            const tasks = await this.taskService.getAllTasks();
            res.status(200).json(tasks);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    };

    updateTask = async (req, res) => {
        try {
            const { id } = req.params;
            const updatedTask = await this.taskService.updateTask(id, req.body, req.user);
            res.status(200).json(updatedTask);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    };

    deleteTask = async (req, res) => {
        try {
            const { id } = req.params;
            const result = await this.taskService.deleteTask(id, req.user);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    };

    getTasksForUser = async (req, res) => {
        try {
            const { userId } = req.params;
            const tasks = await this.taskService.getTasksForUser(userId);
            res.status(200).json(tasks);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    };
}

module.exports = new TaskController();