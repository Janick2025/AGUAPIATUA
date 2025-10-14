#!/bin/bash

# Script de deploy para AGUA CAMPOS en Vercel
# Este script facilita el proceso de deploy

echo "🚀 Iniciando deploy de AGUA CAMPOS a Vercel..."
echo ""

# Verificar si hay cambios sin commitear
if [[ -n $(git status -s) ]]; then
    echo "⚠️  Hay cambios sin commitear. Commiteando..."
    git add .
    read -p "📝 Mensaje del commit: " commit_msg
    git commit -m "$commit_msg"
fi

# Push a GitHub
echo "📤 Pushing a GitHub..."
git push origin main

echo ""
echo "✅ Deploy iniciado!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Ve a https://vercel.com/dashboard"
echo "2. Verifica que el deploy esté en progreso"
echo "3. Una vez completado, visita: https://aguacampos-app.vercel.app"
echo ""
echo "🔗 URLs importantes:"
echo "   - Frontend: https://aguacampos-app.vercel.app"
echo "   - Backend API: https://aguacampos-production.up.railway.app/api"
echo ""
