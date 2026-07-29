const { DataTypes } = require('sequelize');
const sequelize = require('./database'); 

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // KORUMA 1: İki aynı kullanıcı adı olamaz
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
        unique: true // KORUMA 2: Aynı TC ile iki kayıt açılamaz
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // KORUMA 3: Her e-posta tek bir hesaba bağlı olmalı
    },
    role: {
        type: DataTypes.STRING
    },
    isFirstLogin: {
        type: DataTypes.BOOLEAN,
        defaultValue: true // YENİ: Yeni açılan her hesap şifre değiştirmek ZORUNDADIR
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
});

module.exports = User;