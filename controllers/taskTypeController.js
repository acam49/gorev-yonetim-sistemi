const taskTypeService = require('../services/taskTypeService');
const { toTaskTypeDto, toTaskTypeListDto } = require('../dtos/taskTypeDto');

class TaskTypeController {
    constructor(typeSvc = taskTypeService) {
        this.taskTypeService = typeSvc;
    }

    getAllTypes = async (req, res, next) => {
        try {
            const types = await this.taskTypeService.getAllTypes();
            res.status(200).json(toTaskTypeListDto(types));
        } catch (error) {
            next(error);
        }
    };

    createType = async (req, res, next) => {
        try {
            const newType = await this.taskTypeService.createType(req.body);
            res.status(201).json(toTaskTypeDto(newType));
        } catch (error) {
            next(error);
        }
    };

    deleteType = async (req, res, next) => {
        try {
            const { id } = req.params;
            const result = await this.taskTypeService.deleteType(id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new TaskTypeController();
