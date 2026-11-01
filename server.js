require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { notFound, errorHandler } = require('./middleware/errorhandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch((err) => console.error('Error al conectar a MongoDB:', err.message));

app.get('/', (req, res) => {
  res.send('Servidor funcionando');
});

app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/auth', require('./routes/auth'));

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});