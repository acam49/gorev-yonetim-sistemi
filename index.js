const express = require('express');
const cors = require('cors'); 
require('dotenv').config();
const bcrypt = require('bcryptjs'); // Şifreleme kütüphanesi (projedeki tek standart paket)

// Veritabanı bağlantısı ve modellerin İLK ÖNCE içeri aktarılması
const sequelize = require('./models/database'); 
const User = require('./models/User');
const Task = require('./models/Task');
const SystemLog = require('./models/SystemLog');
const TaskType = require('./models/TaskType');

// Tablo İlişkileri (Associations)
User.hasMany(Task, { foreignKey: 'assignedToId', as: 'tasks' });
Task.belongsTo(User, { foreignKey: 'assignedToId', as: 'assignedTo' });
User.hasMany(SystemLog, { foreignKey: 'userId', as: 'logs' });
SystemLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

const app = express();

// Middleware (İzinler ve Ayarlar)
app.use(cors()); 
app.use(express.json()); 

// Rotalar
const taskRoutes = require('./routes/taskRoutes');
const taskTypeRoutes = require('./routes/taskTypeRoutes');
app.use('/api/tasks', taskRoutes);
app.use('/api/task-types', taskTypeRoutes);
const logRoutes = require('./routes/logRoutes');
app.use('/api/logs', logRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;

// Veritabanı senkronizasyonu ve Tohumlama (Seeding)
async function initDB() {
    try {
        await sequelize.authenticate();
        console.log('Veritabanı bağlantısı başarıyla kuruldu.');
        
        await sequelize.sync({ alter: true });
        console.log('Veritabanı tabloları senkronize edildi.');

        // TAVUK-YUMURTA ÇÖZÜMÜ: Eğer tabloda hiç kullanıcı yoksa ilk Admini oluştur
        const userCount = await User.count();
        if (userCount === 0) {
            const hashedPassword = await bcrypt.hash('Admin123', 10);
            
            await User.create({
                username: 'admin',
                fullName: 'Sistem Yoneticisi',
                email: 'admin@sistem.com',
                tcNo: '00000000000',
                password: hashedPassword,
                role: 'Admin',
                isFirstLogin: false
            });
            console.log('Kurumsal Admin olusturuldu! Kullanici: admin  Sifre: Admin123');
        }

    } catch (error) {
        console.error('Veritabanına bağlanılırken veya senkronize edilirken hata oluştu:', error);
    }
}

initDB();

app.get('/', (req, res) => {
    res.send('Merhaba Dünya! Görev Yönetim Sistemi API başarıyla çalışıyor.');
});

app.listen(PORT, () => {
    console.log(`Sunucu ayağa kalktı! http://localhost:${PORT} adresinden test edebilirsin.`);
});