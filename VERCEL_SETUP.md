# ▲ Configuración de Vercel para AGUA CAMPOS

## 📋 Pasos para cambiar el dominio en Vercel

### Método 1: Desde el Dashboard de Vercel (Recomendado)

#### 1. Acceder al proyecto
1. Ve a https://vercel.com/dashboard
2. Busca tu proyecto actual (probablemente llamado "aguapiatua" o similar)
3. Haz click en el proyecto

#### 2. Cambiar el nombre del proyecto
1. Ve a **Settings** (⚙️)
2. En la sección **General**
3. Busca **Project Name**
4. Cambia el nombre a: `aguacampos-app`
5. Click en **Save**
6. Vercel te pedirá confirmar escribiendo el nombre del proyecto

#### 3. Actualizar los dominios
Después de cambiar el nombre, Vercel generará automáticamente:
- **Dominio nuevo**: `aguacampos-app.vercel.app`
- **Dominio anterior**: `aguapiatua-app.vercel.app` (se mantendrá activo)

Para gestionar dominios:
1. Ve a **Settings** > **Domains**
2. Verás todos los dominios asignados
3. Para agregar dominio personalizado:
   - Click en **Add**
   - Ingresa: `aguacampos.com` (tu dominio)
   - Sigue las instrucciones de DNS

4. Para eliminar dominio antiguo:
   - Click en el dominio antiguo
   - Click en **Remove**
   - Confirma la eliminación

### Método 2: Usando Vercel CLI

Si tienes Vercel CLI instalado:

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Login
vercel login

# Desde la raíz del proyecto
vercel --prod

# Cambiar configuración del proyecto
vercel project rm aguapiatua-app  # Opcional: eliminar proyecto antiguo
vercel --name aguacampos-app --prod
```

### Método 3: Redeployar desde GitHub

Si tu proyecto está conectado a GitHub (lo más probable):

1. **Vercel detectará automáticamente** los nuevos commits
2. El proyecto se redesplegaría automáticamente
3. Pero **el nombre del proyecto no cambiará** hasta que lo hagas manualmente

Para cambiar el nombre:
1. Ve al Dashboard de Vercel
2. Settings > General > Project Name
3. Cambia a `aguacampos-app`

---

## 🔧 Configuración actual

### Vercel.json
```json
{
  "installCommand": "npm install --legacy-peer-deps",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Esta configuración:
- ✅ Instala dependencias con legacy-peer-deps
- ✅ Ejecuta el build de producción
- ✅ Sirve desde el directorio `dist`
- ✅ Redirige todas las rutas a index.html (SPA)

---

## 🌐 Variables de entorno en Vercel

Asegúrate de configurar estas variables en Vercel:

1. Ve a **Settings** > **Environment Variables**
2. Agrega las siguientes variables:

```env
NODE_ENV=production
VITE_API_URL=https://aguacampos-production.up.railway.app/api
```

**Importante**: Después de agregar variables de entorno, debes redesplegar:
- Ve a **Deployments**
- Click en los 3 puntos del último deploy
- Click en **Redeploy**

---

## 🔗 URLs después del cambio

### Frontend en Vercel
- **URL antigua**: `https://aguapiatua-app.vercel.app`
- **URL nueva**: `https://aguacampos-app.vercel.app`

### Backend en Railway
- **API URL**: `https://aguacampos-production.up.railway.app/api`

---

## ✅ Checklist de verificación

- [ ] Proyecto renombrado en Vercel
- [ ] Dominio principal actualizado
- [ ] Variables de entorno configuradas
- [ ] Deploy completado exitosamente
- [ ] Frontend respondiendo en nuevo dominio
- [ ] Conexión con backend funcionando
- [ ] Google OAuth actualizado (si aplica)

---

## 🔄 Actualizar Google OAuth (Importante)

Si usas Google OAuth, debes actualizar las URIs autorizadas:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** > **Credentials**
4. Edita tu **OAuth 2.0 Client ID**
5. En **Authorized JavaScript origins**, agrega:
   - `https://aguacampos-app.vercel.app`
6. En **Authorized redirect URIs**, agrega:
   - `https://aguacampos-production.up.railway.app/api/auth/google/callback`
7. Guarda los cambios

---

## 🆘 Solución de problemas

### Error: "Build failed"
- Verifica que `npm install --legacy-peer-deps` funcione localmente
- Revisa los logs en el dashboard de Vercel
- Asegúrate de que `dist` se genere correctamente

### Error: "404 Not Found"
- Verifica que `outputDirectory` sea `dist`
- Asegúrate de que las rewrites estén configuradas
- Limpia caché del navegador

### Error: "API connection failed"
- Verifica las variables de entorno en Vercel
- Asegúrate de que `VITE_API_URL` esté configurado
- Verifica que Railway esté funcionando

### Dominio personalizado no funciona
- Verifica los registros DNS
- Espera hasta 48 horas para propagación DNS
- Usa `nslookup aguacampos.com` para verificar

---

## 📞 Recursos útiles

- **Dashboard de Vercel**: https://vercel.com/dashboard
- **Documentación**: https://vercel.com/docs
- **Status**: https://vercel-status.com

---

## 🚀 Deploy rápido

Para redesplegar manualmente:

```bash
# Hacer cambios en el código
git add .
git commit -m "Update to AGUA CAMPOS"
git push

# Vercel desplegará automáticamente
```

---

**Última actualización**: Octubre 2025
**Proyecto**: AGUA CAMPOS
**Stack**: Ionic React + Vite + Vercel
**Dominio recomendado**: `aguacampos-app.vercel.app`
