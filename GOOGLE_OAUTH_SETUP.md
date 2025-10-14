# 🔐 Configuración de Google OAuth para AGUA CAMPOS

## 📋 Credenciales

Las credenciales de Google OAuth están en el archivo `.env` (no incluido en el repositorio por seguridad).

```env
GOOGLE_CLIENT_ID=<tu-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<tu-client-secret>
```

**Importante**: Nunca compartas estas credenciales públicamente.

---

## 🚀 Pasos para actualizar Google OAuth

### 1. Acceder a Google Cloud Console

1. Ve a: https://console.cloud.google.com/
2. Inicia sesión con tu cuenta de Google
3. Selecciona tu proyecto (o créalo si no existe)

### 2. Habilitar APIs necesarias

1. Ve a **APIs & Services** > **Library**
2. Busca y habilita:
   - ✅ **Google+ API** (o People API)
   - ✅ **Google OAuth 2.0**

### 3. Configurar pantalla de consentimiento

1. Ve a **APIs & Services** > **OAuth consent screen**
2. Configura:
   - **User Type**: External (para producción) o Internal (solo organización)
   - **App name**: `AGUA CAMPOS`
   - **User support email**: Tu email
   - **Developer contact**: Tu email
   - **Logo** (opcional): Logo de AGUA CAMPOS
3. **Scopes** necesarios:
   - `email`
   - `profile`
   - `openid`
4. **Save and Continue**

### 4. Actualizar credenciales OAuth 2.0

1. Ve a **APIs & Services** > **Credentials**
2. Busca tu **OAuth 2.0 Client ID** existente
3. Click en el nombre para editarlo

#### A. Authorized JavaScript origins

**Elimina las URLs antiguas** y agrega estas nuevas:

```
✅ Frontend en Vercel:
https://aguacampos-app.vercel.app

✅ Backend en Railway:
https://aguacampos-production.up.railway.app

✅ Para desarrollo local (opcional):
http://localhost:5173
http://localhost:3001
http://localhost:8100
```

#### B. Authorized redirect URIs

**Elimina las URLs antiguas** y agrega estas nuevas:

```
✅ Producción - Railway:
https://aguacampos-production.up.railway.app/api/auth/google/callback

✅ Para desarrollo local (opcional):
http://localhost:3001/api/auth/google/callback
http://localhost:5173/login
```

#### C. Guardar cambios

1. Click en **Save** al final
2. Espera 5-10 minutos para que los cambios se propaguen

---

## 📝 Variables de entorno actualizadas

### Para Railway (Producción)

Ve a Railway Dashboard > tu proyecto > Settings > Variables:

```env
# Google OAuth
GOOGLE_CLIENT_ID=<tu-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<tu-client-secret>
GOOGLE_CALLBACK_URL=https://aguacampos-production.up.railway.app/api/auth/google/callback

# Frontend URL (para CORS)
FRONTEND_URL=https://aguacampos-app.vercel.app
```

**Importante**: Después de agregar/actualizar variables en Railway:
1. Ve a **Deployments**
2. Click en los 3 puntos del último deploy
3. Click en **Redeploy**

### Para desarrollo local

Tu archivo `.env` ya está actualizado con:

```env
FRONTEND_URL=https://aguacampos-app.vercel.app
GOOGLE_CLIENT_ID=<tu-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<tu-client-secret>
GOOGLE_CALLBACK_URL=https://aguacampos-production.up.railway.app/api/auth/google/callback
```

---

## 🧪 Probar Google OAuth

### 1. Verificar que el backend esté funcionando

```bash
# Abrir en el navegador:
https://aguacampos-production.up.railway.app/api/health

# Deberías ver:
{
  "status": "healthy",
  "timestamp": "2025-10-14T...",
  "service": "AGUA CAMPOS API"
}
```

### 2. Probar el flujo de OAuth

1. Ve a: `https://aguacampos-app.vercel.app`
2. Click en **Iniciar sesión con Google**
3. Deberías ser redirigido a Google
4. Selecciona tu cuenta de Google
5. Acepta los permisos
6. Deberías ser redirigido de vuelta a la app logueado

---

## 🔍 Verificar configuración actual

### Opción 1: Desde la consola de Google

1. Ve a: https://console.cloud.google.com/apis/credentials
2. Click en tu OAuth 2.0 Client ID
3. Verifica que las URIs sean correctas

### Opción 2: Descargar configuración

1. En la página de Credentials
2. Click en el ícono de **descarga** (⬇️) junto a tu Client ID
3. Se descargará un archivo JSON con toda la configuración
4. Verifica los campos:
   - `redirect_uris`: Deben incluir la nueva URL de Railway
   - `javascript_origins`: Deben incluir Vercel y Railway

---

## 🆘 Solución de problemas

### Error: "redirect_uri_mismatch"

**Causa**: La URI de redirección no está autorizada

**Solución**:
1. Verifica que en Google Cloud Console tengas:
   ```
   https://aguacampos-production.up.railway.app/api/auth/google/callback
   ```
2. Espera 5-10 minutos después de guardar cambios
3. Limpia caché del navegador
4. Intenta de nuevo

### Error: "Access blocked: This app's request is invalid"

**Causa**: Falta configurar la pantalla de consentimiento

**Solución**:
1. Ve a **OAuth consent screen**
2. Completa todos los campos requeridos
3. Agrega los scopes: `email`, `profile`, `openid`
4. Guarda y vuelve a intentar

### Error: "invalid_client"

**Causa**: Client ID o Secret incorrectos

**Solución**:
1. Verifica las variables en Railway
2. Asegúrate de que no haya espacios extra
3. Verifica que el Client ID sea el correcto
4. Redeploy en Railway

### Error: "origin_mismatch"

**Causa**: El origen JavaScript no está autorizado

**Solución**:
1. Agrega los orígenes en Google Cloud:
   - `https://aguacampos-app.vercel.app`
   - `https://aguacampos-production.up.railway.app`
2. Guarda y espera 5-10 minutos

---

## ✅ Checklist de verificación

### Google Cloud Console
- [ ] Proyecto seleccionado
- [ ] OAuth consent screen configurado
- [ ] Client ID existente encontrado
- [ ] JavaScript origins actualizados:
  - [ ] `https://aguacampos-app.vercel.app`
  - [ ] `https://aguacampos-production.up.railway.app`
- [ ] Redirect URIs actualizados:
  - [ ] `https://aguacampos-production.up.railway.app/api/auth/google/callback`
- [ ] Cambios guardados
- [ ] Esperado 5-10 minutos

### Railway
- [ ] Variables de entorno actualizadas
- [ ] `GOOGLE_CLIENT_ID` configurado
- [ ] `GOOGLE_CLIENT_SECRET` configurado
- [ ] `GOOGLE_CALLBACK_URL` configurado
- [ ] `FRONTEND_URL` configurado
- [ ] Redespleado después de cambios

### Vercel
- [ ] Frontend desplegado
- [ ] URL correcta: `aguacampos-app.vercel.app`

### Pruebas
- [ ] Backend health check funciona
- [ ] Login con email/password funciona
- [ ] Botón de Google aparece
- [ ] Login con Google funciona
- [ ] Usuario se crea en BD
- [ ] Token se guarda correctamente

---

## 📞 Recursos útiles

- **Google Cloud Console**: https://console.cloud.google.com
- **Documentación OAuth 2.0**: https://developers.google.com/identity/protocols/oauth2
- **Guía de OAuth**: https://developers.google.com/identity/protocols/oauth2/web-server

---

## 🔑 Resumen de URLs importantes

```
Frontend (Vercel):
https://aguacampos-app.vercel.app

Backend (Railway):
https://aguacampos-production.up.railway.app

API Health Check:
https://aguacampos-production.up.railway.app/api/health

Google OAuth Callback:
https://aguacampos-production.up.railway.app/api/auth/google/callback

Google OAuth Endpoint:
https://aguacampos-production.up.railway.app/api/auth/google
```

---

**Última actualización**: Octubre 2025
**Proyecto**: AGUA CAMPOS
