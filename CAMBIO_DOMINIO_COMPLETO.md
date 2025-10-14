# 🔄 Guía Completa: Cambio de Dominio AGUA PIATUA → AGUA CAMPOS

Esta guía te ayudará a completar el cambio de nombre y dominio en todos los servicios.

---

## ✅ Ya completado en el código

- ✅ Marca actualizada a "AGUA CAMPOS" en todo el frontend
- ✅ Package.json actualizados (frontend y backend)
- ✅ URLs actualizadas en el código
- ✅ localStorage renombrado (aguacampos_token, aguacampos_user)
- ✅ Build completado y pusheado a GitHub
- ✅ Archivos de configuración creados

---

## 📋 Pasos que debes hacer manualmente

### 1️⃣ Cambiar dominio en Railway (Backend)

**Tiempo estimado**: 5 minutos

1. Ve a https://railway.app
2. Inicia sesión y selecciona tu proyecto
3. **Cambiar nombre del proyecto**:
   - Click en Settings (⚙️)
   - Project Name → `AGUACAMPOS` o `aguacampos`
   - Guardar

4. **Cambiar dominio del servicio backend**:
   - Selecciona el servicio backend
   - Ve a Settings > Networking/Domains
   - Elimina el dominio actual: `aguapiatua-production.up.railway.app`
   - Click en "Generate Domain"
   - Railway generará: `aguacampos-production.up.railway.app`

5. **Verificar variables de entorno**:
   - Settings > Variables
   - Asegúrate de tener:
     ```
     NODE_ENV=production
     DB_HOST=<tu-mysql-host>
     DB_USER=<tu-usuario>
     DB_PASSWORD=<tu-password>
     DB_NAME=aguacampos_db
     JWT_SECRET=<tu-secret>
     GOOGLE_CLIENT_ID=<tu-google-id>
     GOOGLE_CLIENT_SECRET=<tu-google-secret>
     FRONTEND_URL=https://aguacampos-app.vercel.app
     ```

6. **Verificar deploy**:
   - Espera a que el deploy termine
   - Visita: `https://aguacampos-production.up.railway.app/api/health`
   - Deberías ver: `{"status":"healthy","service":"AGUA CAMPOS API"}`

📄 **Guía detallada**: `RAILWAY_SETUP.md`

---

### 2️⃣ Cambiar dominio en Vercel (Frontend)

**Tiempo estimado**: 5 minutos

1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto (probablemente "aguapiatua-app")
3. **Cambiar nombre del proyecto**:
   - Settings > General > Project Name
   - Cambia a: `aguacampos-app`
   - Guardar (te pedirá confirmar)

4. **Gestionar dominios**:
   - Settings > Domains
   - Verás el nuevo dominio: `aguacampos-app.vercel.app`
   - (Opcional) Elimina el dominio antiguo si quieres

5. **Configurar variables de entorno** (opcional):
   - Settings > Environment Variables
   - Agrega: `VITE_API_URL=https://aguacampos-production.up.railway.app/api`
   - Redeploy si agregas variables

6. **Verificar deploy**:
   - Ve a Deployments
   - Vercel redespleará automáticamente
   - Visita: `https://aguacampos-app.vercel.app`

📄 **Guía detallada**: `VERCEL_SETUP.md`

---

### 3️⃣ Actualizar Google OAuth (Importante)

**Tiempo estimado**: 5 minutos

Si usas login con Google, debes actualizar las URIs:

1. Ve a https://console.cloud.google.com/
2. Selecciona tu proyecto
3. **APIs & Services** > **Credentials**
4. Edita tu **OAuth 2.0 Client ID**
5. **Authorized JavaScript origins**:
   - Agrega: `https://aguacampos-app.vercel.app`
   - Agrega: `https://aguacampos-production.up.railway.app`
6. **Authorized redirect URIs**:
   - Agrega: `https://aguacampos-production.up.railway.app/api/auth/google/callback`
7. **Guardar cambios**

---

### 4️⃣ Actualizar base de datos (Opcional)

Si quieres renombrar la base de datos:

```sql
-- Conectarte a MySQL
CREATE DATABASE aguacampos_db;

-- Copiar datos de la BD antigua
mysqldump -u usuario -p aguapiatua_db > backup.sql
mysql -u usuario -p aguacampos_db < backup.sql

-- Actualizar variable en Railway
DB_NAME=aguacampos_db
```

---

## 🔗 URLs finales

Después de completar todos los pasos:

### Frontend (Vercel)
- **Producción**: `https://aguacampos-app.vercel.app`

### Backend (Railway)
- **API**: `https://aguacampos-production.up.railway.app/api`
- **Health check**: `https://aguacampos-production.up.railway.app/api/health`
- **Endpoints**:
  - `/api/auth/login` - Login
  - `/api/auth/register` - Registro
  - `/api/products` - Productos
  - `/api/orders` - Pedidos

---

## ✅ Checklist final

### Railway
- [ ] Proyecto renombrado
- [ ] Dominio del backend actualizado
- [ ] Variables de entorno configuradas
- [ ] Deploy completado
- [ ] API respondiendo en nuevo dominio
- [ ] Base de datos conectada

### Vercel
- [ ] Proyecto renombrado
- [ ] Dominio del frontend actualizado
- [ ] Variables de entorno configuradas (opcional)
- [ ] Deploy completado
- [ ] App cargando correctamente
- [ ] Conexión con API funcionando

### Google OAuth
- [ ] JavaScript origins actualizadas
- [ ] Redirect URIs actualizadas
- [ ] Login de Google funcionando

### Pruebas finales
- [ ] Login con email/password funciona
- [ ] Login con Google funciona
- [ ] Productos se cargan desde la BD
- [ ] Se pueden crear pedidos
- [ ] Dashboard de admin funciona
- [ ] Dashboard de vendedor funciona

---

## 🆘 Solución de problemas

### Error: "Failed to fetch" o "Network Error"
**Causa**: El frontend no puede conectar con el backend

**Solución**:
1. Verifica que Railway esté desplegado: `https://aguacampos-production.up.railway.app/api/health`
2. Verifica que la URL en `src/services/apiService.ts` sea correcta
3. Limpia caché del navegador (Ctrl+Shift+Delete)
4. Usa modo incógnito para probar

### Error: "CORS blocked"
**Causa**: CORS no está configurado correctamente

**Solución**:
1. Verifica que `FRONTEND_URL` en Railway esté correcto
2. Debe ser: `https://aguacampos-app.vercel.app`
3. Redeploy en Railway después de cambiar

### Error: "Invalid token" o "Unauthorized"
**Causa**: El token antiguo ya no es válido

**Solución**:
1. Limpia localStorage del navegador
2. Vuelve a hacer login
3. Los nuevos tokens usarán `aguacampos_token`

### Google OAuth no funciona
**Causa**: URIs no actualizadas en Google Cloud

**Solución**:
1. Revisa Google Cloud Console
2. Verifica que las URIs estén correctas
3. Espera 5-10 minutos para que los cambios se propaguen

---

## 📞 Contacto y recursos

- **GitHub**: https://github.com/Janick2025/AGUAPIATUA
- **Railway Dashboard**: https://railway.app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Google Cloud Console**: https://console.cloud.google.com

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, tu aplicación estará funcionando con:
- ✅ Nombre: **AGUA CAMPOS**
- ✅ Frontend: `aguacampos-app.vercel.app`
- ✅ Backend: `aguacampos-production.up.railway.app`

**Tiempo total estimado**: 15-20 minutos

---

**Última actualización**: Octubre 2025
**Proyecto**: AGUA CAMPOS
**Stack**: Ionic React + Node.js + MySQL + Vercel + Railway
