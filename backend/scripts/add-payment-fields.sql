-- Agregar campos de método de pago y comprobante a la tabla orders

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(20) DEFAULT 'efectivo',
ADD COLUMN IF NOT EXISTS comprobante_pago VARCHAR(255) NULL;

-- Mostrar estructura actualizada
DESCRIBE orders;
