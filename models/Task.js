const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Task = sequelize.define('Task', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Yapılacak' 
    },
    startDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW // Görevin sisteme girildiği (atanma) an
    },
    plannedDate: {
        type: DataTypes.DATE, // Göreve başlanması planlanan tarih
        allowNull: true
    },
    deadline: {
        type: DataTypes.DATE, // Görevin bitmesi gereken tarih
        allowNull: true
    },
    taskTypeId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

module.exports = Task;