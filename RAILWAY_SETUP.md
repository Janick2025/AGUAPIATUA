# 🚂 Configuración de Railway para AGUA CAMPOS

## 📋 Pasos para cambiar el dominio del proyecto

### 1. Acceder al Dashboard de Railway
1. Ve a https://railway.app
2. Inicia sesión con tu cuenta
3. Busca y selecciona tu proyecto actual

### 2. Cambiar el nombre del proyecto
1. En el proyecto, haz click en **Settings** (⚙️)
2. Busca la sección **Project Name**
3. Cambia el nombre a: `aguacampos` o `AGUACAMPOS`
4. Guarda los cambios

### 3. Actualizar el dominio del servicio Backend
1. En tu proyecto, selecciona el servicio **backend**
2. Ve a la pestaña **Settings**
3. Busca la sección **Domains** o **Public Networking**
4. Verás el dominio actual: `aguapiatua-production.up.railway.app`
5. Haz click en el ícono de **🗑️ Delete** junto al dominio
6. Confirma la eliminación
7. Haz click en **+ Generate Domain**
8. Railway generará automáticamente: `aguacampos-production.up.railway.app`
9. Copia este nuevo dominio

### 4. Variables de entorno (verificar)
Asegúrate de que las variables de entorno estén configuradas:

```env
NODE_ENV=production
PORT=3001
DB_HOST=<tu-host-mysql>
DB_USER=<tu-usuario>
DB_PASSWORD=<tu-password>
DB_NAME=aguacampos_db
DB_PORT=3306
JWT_SECRET=<tu-secret>
GOOGLE_CLIENT_ID=<tu-google-client-id>
GOOGLE_CLIENT_SECRET=<tu-google-client-secret>
FRONTEND_URL=https://aguacampos-app.vercel.app
```

### 5. Redeploy (opcional)
Si es necesario, fuerza un nuevo deploy:
1. Ve a **Deployments**
2. Haz click en los 3 puntos del último deploy
3. Selecciona **Redeploy**

### 6. Verificar el despliegue
Una vez completado el deploy:
1. Visita: `https://aguacampos-production.up.railway.app/api/health`
2. Deberías ver:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-14T...",
  "service": "AGUA CAMPOS API"
}
```

## 🔗 URLs actualizadas

### Backend API
- **URL antigua**: `https://aguapiatua-production.up.railway.app/api`
- **URL nueva**: `https://aguacampos-production.up.railway.app/api`

### Frontend
El código ya está actualizado para usar la nueva URL automáticamente.

## ✅ Checklist de verificación

- [ ] Proyecto renombrado en Railway
- [ ] Dominio del backend actualizado
- [ ] Variables de entorno verificadas
- [ ] Deploy completado exitosamente
- [ ] API respondiendo en el nuevo dominio
- [ ] Frontend conectando correctamente

## 🆘 Solución de problemas

### Error: "Failed to fetch"
- Verifica que el dominio en `src/services/apiService.ts` coincida con Railway
- Limpia caché del navegador (Ctrl+Shift+Delete)
- Usa modo incógnito para probar

### Error: "Database connection failed"
- Revisa las variables de entorno en Railway
- Verifica que la base de datos esté activa
- Chequea los logs en Railway

### Error: "CORS blocked"
- Verifica que `FRONTEND_URL` esté configurado correctamente
- Revisa los logs del servidor en Railway

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Railway Dashboard
2. Verifica la consola del navegador (F12)
3. Chequea el estado de la base de datos

---

**Última actualización**: Octubre 2025
**Proyecto**: AGUA CAMPOS
**Stack**: Node.js + MySQL + Ionic React
