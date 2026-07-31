const taskTypeService = require('../services/taskTypeService');

class TaskTypeController {
    constructor(typeSvc = taskTypeService) {
        this.taskTypeService = typeSvc;
    }

    getAllTypes = async (req, res) => {
        try {
            const types = await this.taskTypeService.getAllTypes();
            res.status(200).json(types);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    };

    createType = async (req, res) => {
        try {
            const newType = await this.taskTypeService.createType(req.body);
            res.status(201).json(newType);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    };

    deleteType = async (req, res) => {
        try {
            const { id } = req.params;
            const result = await this.taskTypeService.deleteType(id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    };
}

module.exports = new TaskTypeController();
