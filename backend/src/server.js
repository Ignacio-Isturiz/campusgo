const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./auth/auth.routes');

const app = express();

app.use(cors());
app.use(express.json());

const mongoose = require('mongoose');

app.get('/', (req, res) => {
  res.json({
    message: 'Backend funcionando 🚀'
  });
});

app.get('/status', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado';
  res.json({
    backend: 'Corriendo',
    mongodb: dbStatus
  });
});

app.use('/auth', authRoutes);

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('No se pudo iniciar el servidor', error);
  process.exit(1);
});