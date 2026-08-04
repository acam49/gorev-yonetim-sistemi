const taskService = require('../services/taskService');
const { toTaskDto, toTaskListDto } = require('../dtos/taskDto');

class TaskController {
    constructor(taskSvc = taskService) {
        this.taskService = taskSvc;
    }

    createTask = async (req, res, next) => {
        try {
            const newTask = await this.taskService.createTask(req.body, req.user);
            res.status(201).json(toTaskDto(newTask));
        } catch (error) {
            next(error);
        }
    };

    getTasks = async (req, res, next) => {
        try {
            const tasks = await this.taskService.getAllTasks();
            res.status(200).json(toTaskListDto(tasks));
        } catch (error) {
            next(error);
        }
    };

    updateTask = async (req, res, next) => {
        try {
            const { id } = req.params;
            const updatedTask = await this.taskService.updateTask(id, req.body, req.user);
            res.status(200).json(toTaskDto(updatedTask));
        } catch (error) {
            next(error);
        }
    };

    deleteTask = async (req, res, next) => {
        try {
            const { id } = req.params;
            const result = await this.taskService.deleteTask(id, req.user);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    getTasksForUser = async (req, res, next) => {
        try {
            const { userId } = req.params;
            const tasks = await this.taskService.getTasksForUser(userId);
            res.status(200).json(toTaskListDto(tasks));
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new TaskController();