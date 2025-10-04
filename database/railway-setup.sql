-- ============================================
-- SCRIPT DE CONFIGURACIÓN COMPLETA PARA RAILWAY
-- Agua Piatua - Base de Datos
-- ============================================

-- Tabla de usuarios (clientes, vendedores, admins)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('Cliente', 'Vendedor', 'Admin') NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fcm_token VARCHAR(255) NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_fcm_token (fcm_token)
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    imagen VARCHAR(255),
    categoria VARCHAR(50),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    vendedor_id INT NULL,
    total DECIMAL(10,2) NOT NULL,
    estado ENUM('Pendiente', 'Confirmado', 'En_Preparacion', 'En_Camino', 'Entregado', 'Cancelado') DEFAULT 'Pendiente',
    direccion_entrega TEXT NOT NULL,
    telefono_contacto VARCHAR(20),
    notas TEXT,
    metodo_pago VARCHAR(50) DEFAULT 'Efectivo',
    comprobante_pago VARCHAR(255),
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega_estimada DATETIME,
    fecha_entrega_real DATETIME NULL,
    FOREIGN KEY (cliente_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vendedor_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_orders_cliente (cliente_id),
    INDEX idx_orders_vendedor (vendedor_id),
    INDEX idx_orders_estado (estado),
    INDEX idx_orders_fecha (fecha_pedido)
);

-- Tabla de detalles de pedido
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Tabla de entregas/rutas
CREATE TABLE IF NOT EXISTS deliveries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    vendedor_id INT NOT NULL,
    estado ENUM('Asignado', 'En_Camino', 'Entregado', 'Fallido') DEFAULT 'Asignado',
    ubicacion_actual VARCHAR(255),
    latitud DECIMAL(10,8),
    longitud DECIMAL(11,8),
    comentarios TEXT,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_inicio DATETIME NULL,
    fecha_entrega DATETIME NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (vendedor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_deliveries_vendedor (vendedor_id),
    INDEX idx_deliveries_estado (estado)
);

-- Tabla de sesiones/tokens (para autenticación JWT)
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token_hash),
    INDEX idx_expires (expires_at)
);

-- Tabla de inventario/movimientos
CREATE TABLE IF NOT EXISTS inventory_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    tipo_movimiento ENUM('Entrada', 'Salida', 'Ajuste') NOT NULL,
    cantidad INT NOT NULL,
    referencia VARCHAR(100),
    usuario_id INT NOT NULL,
    motivo TEXT,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar productos iniciales
INSERT INTO products (nombre, descripcion, precio, stock, imagen, categoria) VALUES
('Agua Purificada 1L', 'Botella de agua purificada de 1 litro', 2.50, 100, '/litro.jpg', 'Botellas'),
('Agua Purificada 12U', 'Pack de 12 botellas de agua purificada', 25.00, 50, '/12U.jpg', 'Packs'),
('Garrafón 20L', 'Garrafón de agua purificada de 20 litros', 15.00, 30, '/garrafon.webp', 'Garrafones'),
('Garrafa 5L', 'Garrafa de agua purificada de 5 litros', 8.00, 40, '/garrafa.jpg', 'Garrafas'),
('Hielo 2kg', 'Bolsa de hielo de 2 kilogramos', 5.00, 25, '/hielo.jpg', 'Hielo'),
('Six Pack Premium', 'Six pack de botellas premium 500ml', 18.00, 35, '/Six_Pag.jpg', 'Packs');

-- Insertar usuarios de prueba (las contraseñas se actualizarán con el script setup-database.js)
-- Contraseñas: admin123, vendedor123, cliente123
INSERT INTO users (nombre, email, password, tipo_usuario, telefono, direccion) VALUES
('Admin Sistema', 'admin@aguapiatua.com', '$2b$12$KIXVzDxCF5VHLqhX5Hqzg.lQZJ8qHdqHwj5QqKZYvN5VqZYvN5Vq', 'Admin', '555-0001', 'Oficina Central'),
('Juan Pérez', 'vendedor@aguapiatua.com', '$2b$12$KIXVzDxCF5VHLqhX5Hqzg.lQZJ8qHdqHwj5QqKZYvN5VqZYvN5Vq', 'Vendedor', '555-0002', 'Zona Norte'),
('María González', 'cliente@example.com', '$2b$12$KIXVzDxCF5VHLqhX5Hqzg.lQZJ8qHdqHwj5QqKZYvN5VqZYvN5Vq', 'Cliente', '555-0003', 'Av. Principal 123');

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
