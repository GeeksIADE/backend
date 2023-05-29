const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 7000;
const ws_port = 7001;
const http = require('http');
const socketIO = require('socket.io');
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: '*', // Allow requests from any origin, you can restrict it to your frontend URL
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
    },
});
const socketio = io.of('/chat'); // Namespace for the chat

socketio.on('connection', (socket) => {
    socket.on('join', (data) => {
        const { room_id, user_id } = data;
        const roomChannel = `room:${room_id}`;

        // Join the room's WebSocket channel
        socket.join(roomChannel);
        socket.join(`${roomChannel}:${user_id}`);
    });

    socket.on('leave', (data) => {
        const { room_id, user_id } = data;
        const roomChannel = `room:${room_id}`;

        // Leave the room's WebSocket channel
        socket.leave(roomChannel);
        socket.leave(`${roomChannel}:${user_id}`);
    });

    socket.on('chatMessage', (data) => {
        const { room_id, user_id, message, username } = data;
        const roomChannel = `room:${room_id}`;

        // Broadcast the chat message to all users in the room
        socketio.to(roomChannel).emit('chatMessage', { user_id, username, message });
    });
});

require('dotenv').config();

// import routes
const authRoute = require('./routes/authRoutes');
const userRoute = require('./routes/userRoutes');
const gameRoutes = require('./routes/gameRoutes');
const userGameRoutes = require('./routes/userGameRoutes');
const profileRoutes = require('./routes/profileRoutes');
const roomRoutes = require('./routes/roomRoutes');
const modeRoutes = require('./routes/modeRoutes');

// import middleware
const { errorMiddleware } = require('./middleware/errorMiddleware');

const { authMiddleware } = require('./middleware/authMiddleware');
app.use(cors());

// set headers for preflight requests
app.options('*', cors((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*',);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    // res.sendStatus(200);
}));

app.use(bodyParser.json());

// Set the socketio property on the app object
// app.set('socketio', socketio);
app.set('socketio', io);

// route middlewares
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/users', userGameRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/modes', modeRoutes);

// error middleware
app.use(errorMiddleware);
app.use(authMiddleware);

server.listen(ws_port, () => {
    console.log(`Server running at port ${ws_port}`);
});

app.listen(port, () => console.log("Server running at port " + port));
