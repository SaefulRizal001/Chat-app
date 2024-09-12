// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Melayani file statis dari folder public
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected');

    // Menerima pesan dari client
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg); // Mengirimkan pesan ke semua client
    });

    // Notifikasi ketika user disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Menjalankan server
server.listen(3000, () => {
    console.log('Server listening on http://localhost:3000');
});
