const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();

connectDB();

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});