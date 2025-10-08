const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Inicializar Firebase para notificaciones push
const { initializeFirebase } = require('./services/pushNotificationService');
initializeFirebase();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const deliveryRoutes = require('./routes/deliveries');
const uploadRoutes = require('./routes/uploads');
const adminRoutes = require('./routes/admin');
const statsRoutes = require('./routes/stats');

const app = express();

// Confiar en proxies (necesario para ngrok)
app.set('trust proxy', 1);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Permitir localhost y ngrok
      const allowedOrigins = [
        'http://localhost:5173',
        /\.ngrok-free\.app$/,  // Permitir cualquier subdominio de ngrok
        /\.ngrok\.io$/  // Permitir ngrok.io también
      ];

      if (!origin || allowedOrigins.some(pattern =>
        typeof pattern === 'string' ? pattern === origin : pattern.test(origin)
      )) {
        callback(null, true);
      } else {
        callback(null, true); // Permitir todos en desarrollo
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});
const PORT = process.env.PORT || 3001;

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: false, // Desactivar CSP para desarrollo
  crossOriginEmbedderPolicy: false
}));

// Rate limiting - Configuración generosa para Railway Pro
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 1000, // 1000 requests por minuto (muy generoso)
  message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS - Permitir localhost y ngrok
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      /\.ngrok-free\.app$/,
      /\.ngrok\.io$/,
      /\.vercel\.app$/
    ];

    if (!origin || allowedOrigins.some(pattern =>
      typeof pattern === 'string' ? pattern === origin : pattern.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(null, true); // Permitir todos en desarrollo
    }
  },
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (uploads y frontend)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Servir archivos estáticos del frontend en producción
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Middleware para deshabilitar caché en API
app.use('/api/', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Hacer io disponible en todas las rutas
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.IO - Gestión de conexiones
io.on('connection', (socket) => {
  console.log(`✅ Usuario conectado: ${socket.id}`);

  // Usuario se identifica (admin o vendedor)
  socket.on('identify', (data) => {
    socket.userId = data.userId;
    socket.userType = data.userType;
    console.log(`🔐 Usuario identificado: ${data.userType} (ID: ${data.userId})`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Usuario desconectado: ${socket.id}`);
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stats', statsRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Agua Piatua API'
  });
});

// Manejo de errores 404 para API
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Ruta catch-all: servir index.html para todas las demás rutas (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

// Manejo global de errores
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'El recurso ya existe' });
  }
  
  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ error: 'Referencia inválida' });
  }
  
  res.status(error.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : error.message
  });
});

// Iniciar servidor con Socket.IO
server.listen(PORT, () => {
  console.log(`🚀 Servidor Agua Piatua API ejecutándose en puerto ${PORT}`);
  console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`⚡ Socket.IO habilitado para notificaciones en tiempo real`);
});

module.exports = { app, io };