# 🚀 Guía para Desplegar en Vercel - AGUA CAMPOS

## 🔴 Error actual: 404 DEPLOYMENT_NOT_FOUND

Este error significa que el proyecto no está desplegado en Vercel o se eliminó. Vamos a desplegarlo de nuevo.

---

## 📋 Método 1: Desplegar desde Vercel Dashboard (Más fácil - Recomendado)

### Paso 1: Acceder a Vercel
1. Ve a https://vercel.com/login
2. Inicia sesión con tu cuenta

### Paso 2: Importar proyecto desde GitHub
1. Click en **Add New** > **Project**
2. Busca tu repositorio: `Janick2025/AGUAPIATUA`
3. Click en **Import**

### Paso 3: Configurar el proyecto
En la pantalla de configuración:

**Project Name:**
```
aguacampos-app
```

**Framework Preset:**
```
Vite
```

**Root Directory:**
```
./
(dejar vacío o en la raíz)
```

**Build and Output Settings:**
```
Build Command:          npm run build
Output Directory:       dist
Install Command:        npm install --legacy-peer-deps
```

**Environment Variables:** (opcional)
```
VITE_API_URL=https://aguacampos-production.up.railway.app/api
```

### Paso 4: Deploy
1. Click en **Deploy**
2. Espera 2-3 minutos mientras Vercel construye tu app
3. Una vez completado, verás la URL: `aguacampos-app.vercel.app`

---

## 📋 Método 2: Desplegar con Vercel CLI

### Paso 1: Instalar Vercel CLI
```bash
npm i -g vercel
```

### Paso 2: Login
```bash
vercel login
```
Sigue las instrucciones para autenticarte.

### Paso 3: Desplegar
Desde la raíz del proyecto:

```bash
# Primera vez (configuración inicial)
vercel

# Responde las preguntas:
# ? Set up and deploy "~/AGUAPIATUA 2.0"? [Y/n] y
# ? Which scope do you want to deploy to? [Tu usuario]
# ? Link to existing project? [y/N] n
# ? What's your project's name? aguacampos-app
# ? In which directory is your code located? ./
# ? Want to override the settings? [y/N] y

# Build settings:
# ? What's your Build Command? npm run build
# ? What's your Output Directory? dist
# ? What's your Development Command? npm run dev

# Desplegar a producción
vercel --prod
```

---

## 📋 Método 3: Conectar GitHub (Recomendado para CI/CD)

Este método desplegará automáticamente cada vez que hagas push a GitHub.

### Paso 1: En Vercel Dashboard
1. Ve a https://vercel.com/dashboard
2. Click en **Add New** > **Project**
3. Click en **Import Git Repository**
4. Autoriza acceso a GitHub si es necesario
5. Selecciona: `Janick2025/AGUAPIATUA`

### Paso 2: Configurar
```
Project Name: aguacampos-app
Framework: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install --legacy-peer-deps
```

### Paso 3: Deploy
1. Click en **Deploy**
2. A partir de ahora, cada `git push` desplegará automáticamente

---

## 🔧 Solución de problemas

### Error: "Build failed"

**Causa**: Problemas con dependencias o build

**Solución**:
1. Verifica que `npm run build` funcione localmente
2. Asegúrate de usar `npm install --legacy-peer-deps`
3. Revisa los logs en Vercel Dashboard

### Error: "Command not found: vite"

**Causa**: Dependencias no instaladas correctamente

**Solución**:
1. En Vercel, configura Install Command: `npm install --legacy-peer-deps`
2. Redeploy

### Error: "404 on all routes"

**Causa**: Las rewrites no están configuradas

**Solución**:
1. Verifica que `vercel.json` esté en la raíz
2. Debe tener:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Error: "Module not found: @ionic/react"

**Causa**: Dependencias de desarrollo no instaladas

**Solución**:
1. Todas las dependencias deben estar en `dependencies`, no en `devDependencies`
2. En el proyecto, Ionic está correctamente en `dependencies` ✅

---

## ✅ Verificar que funcione

Después de desplegar:

### 1. Verificar URL
Visita tu nueva URL de Vercel (debería ser algo como):
```
https://aguacampos-app.vercel.app
```

### 2. Probar funcionalidades
- [ ] La app carga correctamente
- [ ] Splash screen aparece
- [ ] Login se muestra
- [ ] Puedes navegar entre páginas

### 3. Verificar conexión con API
- [ ] Abre la consola del navegador (F12)
- [ ] Intenta hacer login
- [ ] Verifica que las peticiones vayan a: `aguacampos-production.up.railway.app`

---

## 🔗 Configurar dominio personalizado (Opcional)

Si tienes un dominio propio:

### En Vercel Dashboard:
1. Ve a tu proyecto > **Settings** > **Domains**
2. Click en **Add**
3. Ingresa tu dominio: `aguacampos.com`
4. Sigue las instrucciones para configurar DNS

### Registros DNS necesarios:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## 📱 URLs finales

Después del deploy:

```
Frontend (Vercel):
https://aguacampos-app.vercel.app

Backend (Railway):
https://aguacampos-production.up.railway.app/api

GitHub:
https://github.com/Janick2025/AGUAPIATUA
```

---

## 🎯 Siguientes pasos

Después de desplegar en Vercel:

1. ✅ Actualiza las variables de entorno en Railway:
   ```
   FRONTEND_URL=https://aguacampos-app.vercel.app
   ```

2. ✅ Actualiza Google OAuth origins:
   ```
   https://aguacampos-app.vercel.app
   ```

3. ✅ Prueba el login y todas las funcionalidades

---

## 📞 Recursos

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Docs**: https://vercel.com/docs
- **Deploy Logs**: En el dashboard, click en el deployment para ver logs

---

**Última actualización**: Octubre 2025
**Proyecto**: AGUA CAMPOS
**Stack**: Ionic React + Vite + Vercel
