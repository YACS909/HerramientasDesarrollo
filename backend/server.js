require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json()); // Para parsear JSON en el body

// Rutas base (las llenaremos cuando tengamos el SQL)
app.get('/', (req, res) => {
  res.send('API de Huancayork Inmobiliaria funcionando correctamente.');
});

// Rutas API
app.use('/api/asesores', require('./routes/asesores'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/inmuebles', require('./routes/inmuebles'));
app.use('/api/contratos', require('./routes/contratos'));
app.use('/api/visitas', require('./routes/visitas'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
