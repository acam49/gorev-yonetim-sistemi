const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Modeller ve ilişkiler merkezi dosyadan yükleniyor
const { sequelize } = require('./models');

// Servisler
const userService = require('./services/userService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rotalar
const taskRoutes = require('./routes/taskRoutes');
const taskTypeRoutes = require('./routes/taskTypeRoutes');
const logRoutes = require('./routes/logRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/tasks', taskRoutes);
app.use('/api/task-types', taskTypeRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;

// Veritabanı senkronizasyonu ve ilk admin oluşturma
async function initDB() {
    try {
        await sequelize.authenticate();
        console.log('Veritabanı bağlantısı başarıyla kuruldu.');

        await sequelize.sync({ alter: true });
        console.log('Veritabanı tabloları senkronize edildi.');

        // İlk admin oluşturma — Service katmanı üzerinden
        await userService.seedAdmin();

    } catch (error) {
        console.error('Veritabanına bağlanılırken veya senkronize edilirken hata oluştu:', error);
        process.exit(1);
    }
}

initDB();

app.get('/', (req, res) => {
    res.send('Görev Yönetim Sistemi API başarıyla çalışıyor.');
});

app.listen(PORT, () => {
    console.log(`Sunucu ayağa kalktı! http://localhost:${PORT} adresinden test edebilirsin.`);
});