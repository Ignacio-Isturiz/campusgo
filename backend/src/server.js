const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

const { Server } = require('socket.io');

const connectDB = require('./config/db');

const postRoutes = require(
  './routes/postRoutes'
);
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

global.io = io;

// conectar mongodb
connectDB();

// middlewares
app.use(cors());

// increase payload size to allow base64 image uploads from client
app.use(express.json({ limit: process.env.EXPRESS_JSON_LIMIT || '10mb' }));
app.use(express.urlencoded({ limit: process.env.EXPRESS_JSON_LIMIT || '10mb', extended: false }));

// Files are now served from GridFS via /api/files/:id
const fileRoutes = require('./routes/fileRoutes');
app.use('/api/files', fileRoutes);

// pasar io
app.use((req, res, next) => {
  req.io = io;

  next();
});

// sockets
io.on('connection', socket => {
  console.log(
    'Usuario conectado'
  );

  socket.on('disconnect', () => {
    console.log(
      'Usuario desconectado'
    );
  });
});

// rutas
app.use(
  '/api/posts',
  postRoutes
);
// auth routes (expose endpoints like /auth/login/request-otp)
app.use('/auth', authRoutes);

// ruta test
app.get('/', (req, res) => {
  res.json({
    message:
      'Backend funcionando 🚀',
  });
});

const PORT = process.env.PORT || 5000;

// bind to 0.0.0.0 so the server is reachable from other devices on the LAN
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`Servidor corriendo en http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
});
