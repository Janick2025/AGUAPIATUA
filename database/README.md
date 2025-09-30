# Configuración de Base de Datos - Agua Piatua 2.0

## Requisitos previos
- MySQL Server 8.0+ instalado y ejecutándose
- Node.js 18+ para el backend
- npm o yarn para gestión de paquetes

## Configuración inicial

### 1. Crear la base de datos
Ejecuta el script `schema.sql` en tu servidor MySQL:

```bash
mysql -u root -p < database/schema.sql
```

O desde el cliente MySQL:
```sql
source /ruta/completa/database/schema.sql
```

### 2. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto:

```env
# Configuración de base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=agua_piatua
DB_USER=root
DB_PASSWORD=tu_password_mysql

# Configuración JWT
JWT_SECRET=tu_clave_secreta_muy_segura_aqui
JWT_EXPIRES_IN=24h

# Configuración del servidor
PORT=3001
NODE_ENV=development

# URLs del frontend
FRONTEND_URL=http://localhost:5173
```

### 3. Estructura de la base de datos

#### Tablas principales:
- **users**: Clientes, vendedores y administradores
- **products**: Catálogo de productos de agua
- **orders**: Pedidos de los clientes
- **order_items**: Detalles de cada pedido
- **deliveries**: Gestión de entregas y rutas
- **inventory_movements**: Control de stock
- **user_sessions**: Sesiones de autenticación

#### Relaciones:
- Un usuario puede tener múltiples pedidos
- Un pedido puede tener múltiples productos
- Cada pedido puede tener una entrega asignada
- Los vendedores pueden manejar múltiples entregas

### 4. Usuarios de prueba incluidos:
- **Admin**: admin@aguapiatua.com / admin123
- **Vendedor**: vendedor@aguapiatua.com / vendedor123  
- **Cliente**: cliente@example.com / cliente123

### 5. Productos incluidos:
- Agua Purificada 1L - $2.50
- Pack 12 botellas - $25.00
- Garrafón 20L - $15.00
- Garrafa 5L - $8.00
- Hielo 2kg - $5.00
- Six Pack Premium - $18.00

## Siguiente paso
Ejecutar el backend API con Node.js + Express para conectar con esta base de datos.