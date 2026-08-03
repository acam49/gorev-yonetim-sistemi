const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Modeller ve ilişkiler merkezi dosyadan yükleniyor
const { sequelize } = require('./models');

// Servisler ve Middleware
const userService = require('./services/userService');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Rotalar
const taskRoutes = require('./routes/taskRoutes');
const taskTypeRoutes = require('./routes/taskTypeRoutes');
const logRoutes = require('./routes/logRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/tasks', taskRoutes);
app.use('/api/task-types', taskTypeRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/users', userRoutes);

// Global Error Handler (Tüm rotaların en altında yer almalı)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Veritabanı senkronizasyonu ve ilk admin oluşturma
async function initDB() {
    try {
        await sequelize.authenticate();
        console.log('Veritabanı bağlantısı başarıyla kuruldu.');

        const isProduction = process.env.NODE_ENV === 'production';
        if (isProduction) {
            console.log('Production modunda veritabanı şema yönetimi migration komutları ile yürütülür.');
        } else {
            await sequelize.sync({ alter: true });
            console.log('Geliştirme (dev) modunda veritabanı tabloları senkronize edildi.');
        }

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