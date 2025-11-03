import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './src/config/database.js';

// Configurar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas básicas
app.get('/', (req, res) => {
  res.json({
    message: 'Backend CEEB - API funcionando correctamente',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Importar rutas
import entregaEquipoRoutes from './src/routes/entregaEquipo.js';
import authRoutes from './src/routes/auth.js';

// Rutas de ejemplo - aquí puedes agregar tu lógica
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Endpoint de prueba funcionando',
    data: {
      status: 'OK',
      timestamp: new Date().toISOString()
    }
  });
});

// Rutas de entrega de equipo
app.use('/api/entrega-equipo', entregaEquipoRoutes);

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Iniciar servidor
app.listen(PORT, HOST, async () => {
  console.log(`🚀 Servidor corriendo en http://${HOST}:${PORT}`);
  console.log(`📝 Entorno: ${process.env.NODE_ENV || 'development'}`);
  
  // Probar conexión a la base de datos
  const dbConnected = await testConnection();
  if (dbConnected) {
    console.log('💾 Base de datos conectada exitosamente');
  } else {
    console.log('⚠️  Ejecutándose sin conexión a base de datos');
  }
});

export default app;