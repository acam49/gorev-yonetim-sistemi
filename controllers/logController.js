const logService = require('../services/logService');

class LogController {
    constructor(logSvc = logService) {
        this.logService = logSvc;
    }

    getAllLogs = async (req, res) => {
        try {
            const logs = await this.logService.getAllLogs();
            res.status(200).json(logs);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    };

    createLog = async (req, res) => {
        try {
            const newLog = await this.logService.createLog(req.body);
            res.status(201).json(newLog);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    };

    deleteLog = async (req, res) => {
        try {
            const { id } = req.params;
            const result = await this.logService.deleteLog(id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    };
}

module.exports = new LogController();
