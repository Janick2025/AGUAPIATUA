# Backend API - Agua Piatua 2.0

API REST completa para la aplicación de delivery de agua Piatua, construida con Node.js, Express y MySQL.

## 🚀 Instalación y configuración

### 1. Instalar dependencias
```bash
cd backend
npm install
```

### 2. Configurar variables de entorno
```bash
# Copiar el archivo de ejemplo
copy .env.example .env

# Editar .env con tus credenciales de MySQL
```

### 3. Configurar base de datos
```bash
# Ejecutar script de configuración automática
npm run setup-db
```

### 4. Iniciar servidor
```bash
# Desarrollo (con nodemon)
npm run dev

# Producción
npm start
```

El servidor estará disponible en: `http://localhost:3001`

## 📊 Estructura de la API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/verify-token` - Verificar token JWT

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto específico
- `POST /api/products` - Crear producto (Admin)
- `PUT /api/products/:id` - Actualizar producto (Admin)
- `PATCH /api/products/:id/stock` - Actualizar stock (Admin/Vendedor)
- `DELETE /api/products/:id` - Desactivar producto (Admin)

### Pedidos
- `GET /api/orders` - Listar pedidos (filtrado por rol)
- `GET /api/orders/pending` - Pedidos pendientes (Admin/Vendedor)
- `GET /api/orders/:id` - Detalles de pedido
- `POST /api/orders` - Crear pedido (Cliente)
- `PUT /api/orders/:id/assign` - Asignar a vendedor
- `PATCH /api/orders/:id/status` - Actualizar estado

### Entregas
- `GET /api/deliveries` - Entregas del vendedor
- `GET /api/deliveries/all` - Todas las entregas (Admin)
- `GET /api/deliveries/:id` - Detalles de entrega
- `PATCH /api/deliveries/:id/location` - Actualizar ubicación
- `PATCH /api/deliveries/:id/status` - Actualizar estado

### Usuarios
- `GET /api/users` - Listar usuarios (Admin)
- `GET /api/users/vendedores` - Listar vendedores (Admin)
- `GET /api/users/:id` - Perfil de usuario

## 🔐 Autenticación

La API usa JWT (JSON Web Tokens) para autenticación:

```javascript
// Incluir token en headers
Authorization: Bearer <tu_token_jwt>
```

### Roles de usuario:
- **Cliente**: Puede crear pedidos y ver sus propios pedidos
- **Vendedor**: Puede ver pedidos asignados, gestionar entregas
- **Admin**: Acceso completo a toda la funcionalidad

## 📈 Base de datos

### Tablas principales:
- `users` - Usuarios del sistema
- `products` - Catálogo de productos
- `orders` - Pedidos de clientes
- `order_items` - Detalles de pedidos
- `deliveries` - Gestión de entregas
- `inventory_movements` - Historial de movimientos de stock

## 🛡️ Seguridad

- Contraseñas hasheadas con bcrypt
- Rate limiting (100 requests/15min)
- Helmet.js para headers de seguridad
- Validación de entrada con Joi
- Autenticación JWT con expiración
- Permisos basados en roles

## 📝 Ejemplos de uso

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "cliente@example.com", "password": "cliente123"}'
```

### Crear pedido
```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "product_id": 1,
        "cantidad": 2,
        "precio_unitario": 2.50
      }
    ],
    "direccion_entrega": "Av. Principal 123",
    "telefono_contacto": "555-1234"
  }'
```

## 🔧 Desarrollo

### Usuarios de prueba incluidos:
- **Admin**: admin@aguapiatua.com / admin123
- **Vendedor**: vendedor@aguapiatua.com / vendedor123
- **Cliente**: cliente@example.com / cliente123

### Scripts disponibles:
- `npm run dev` - Servidor de desarrollo con nodemon
- `npm start` - Servidor de producción
- `npm run setup-db` - Configurar base de datos

## 📋 Variables de entorno

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=agua_piatua
DB_USER=root
DB_PASSWORD=tu_password

JWT_SECRET=clave_secreta_muy_segura
JWT_EXPIRES_IN=24h

PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```