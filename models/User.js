const { DataTypes } = require('sequelize');
const sequelize = require('./database'); 

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fullName: {
        type: DataTypes.STRING
    },
    tcNo: {
        type: DataTypes.STRING,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    role: {
        type: DataTypes.STRING
    },
    isFirstLogin: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    isOnline: {
        type: DataTypes.BOOLEAN,
        defaultValue: false 
    },
    lastLogin: {
        type: DataTypes.DATE 
    },
    lastLogout: {
        type: DataTypes.DATE 
    }
}, {
    defaultScope: {
        attributes: { exclude: ['password'] }
    },
    scopes: {
        withPassword: {
            attributes: {}
        }
    }
});

module.exports = User;