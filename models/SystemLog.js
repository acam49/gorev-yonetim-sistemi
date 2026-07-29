const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const SystemLog = sequelize.define('SystemLog', {
    action: {
        type: DataTypes.STRING,
        allowNull: false
    },
    details: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // KALICI KAYIT: İşlemi yapan kişi daha sonra sistemden silinse veya
    // bilgileri güncellense bile, log geçmişinin bozulmaması için işlemi
    // yapan kişinin adı ve rolü, log oluşturulduğu ANDAKİ haliyle burada
    // ayrıca sabit bir metin olarak saklanır (userId'deki canlı bağlantıya
    // bağımlı kalınmaz).
    actorName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    actorRole: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = SystemLog;