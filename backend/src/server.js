const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');

const { Server } = require('socket.io');

const connectDB = require('./config/db');

const postRoutes = require(
  './routes/postRoutes'
);

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

app.use(express.json());

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

// ruta test
app.get('/', (req, res) => {
  res.json({
    message:
      'Backend funcionando 🚀',
  });
});

const PORT =
  process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `Servidor corriendo en puerto ${PORT}`
  );
});