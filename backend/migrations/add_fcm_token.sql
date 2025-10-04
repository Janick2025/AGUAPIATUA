-- Agregar columna para almacenar tokens de Firebase Cloud Messaging
ALTER TABLE users
ADD COLUMN fcm_token VARCHAR(255) NULL
AFTER activo;

-- Índice para búsquedas rápidas por token
CREATE INDEX idx_fcm_token ON users(fcm_token);
