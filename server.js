const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Melayani file statis dari folder public
app.use(express.static('public'));

// Koneksi ke MySQL menggunakan Sequelize
const sequelize = new Sequelize('chat_app', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
});

// Model untuk pesan
const Message = sequelize.define('Message', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
    },
});

// Sinkronisasi model dengan database
sequelize.sync();

io.on('connection', (socket) => {
    console.log('A user connected');

    // Mengirim riwayat pesan saat pengguna terhubung
    Message.findAll({ order: [['timestamp', 'ASC']] }).then(messages => {
        socket.emit('load messages', messages);
    });

    // Menerima pesan dari client
    socket.on('chat message', async (data) => {
        const newMessage = await Message.create({
            name: data.name,
            message: data.message,
        });
        io.emit('chat message', newMessage); // Kirim pesan ke semua klien
    });

    // Notifikasi ketika user disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Menjalankan server
server.listen(3000, '0.0.0.0', () => {
    console.log('Server listening on http://0.0.0.0:3000');
});
