const { DataTypes } = require('sequelize');
const sequelize = require('./database');

// Görev türleri tablosu — Müdür/Admin buraya türleri ekler,
// görev atarken listeden seçilir (serbest metin yerine)
const TaskType = sequelize.define('TaskType', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

module.exports = TaskType;