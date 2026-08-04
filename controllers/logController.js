const logService = require('../services/logService');
const { toLogDto, toLogListDto } = require('../dtos/logDto');

class LogController {
    constructor(logSvc = logService) {
        this.logService = logSvc;
    }

    getAllLogs = async (req, res, next) => {
        try {
            const logs = await this.logService.getAllLogs();
            res.status(200).json(toLogListDto(logs));
        } catch (error) {
            next(error);
        }
    };

    createLog = async (req, res, next) => {
        try {
            const newLog = await this.logService.createLog(req.body);
            res.status(201).json(toLogDto(newLog));
        } catch (error) {
            next(error);
        }
    };

    deleteLog = async (req, res, next) => {
        try {
            const { id } = req.params;
            const result = await this.logService.deleteLog(id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new LogController();
