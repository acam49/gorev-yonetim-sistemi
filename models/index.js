const sequelize = require('./database');
const User = require('./User');
const Task = require('./Task');
const SystemLog = require('./SystemLog');
const TaskType = require('./TaskType');

// Tablo İlişkileri (Associations)
User.hasMany(Task, { foreignKey: 'assignedToId', as: 'tasks' });
Task.belongsTo(User, { foreignKey: 'assignedToId', as: 'assignedTo' });
User.hasMany(SystemLog, { foreignKey: 'userId', as: 'logs' });
SystemLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
TaskType.hasMany(Task, { foreignKey: 'taskTypeId', as: 'tasks' });
Task.belongsTo(TaskType, { foreignKey: 'taskTypeId', as: 'taskType' });

module.exports = {
    sequelize,
    User,
    Task,
    SystemLog,
    TaskType
};
