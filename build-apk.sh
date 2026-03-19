#!/bin/bash

echo "=========================================="
echo "  Precio Luz - Generar APK Standalone"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js no está instalado${NC}"
    echo "Por favor, instala Node.js desde https://nodejs.org/"
    exit 1
fi

# Verificar Java
if ! command -v java &> /dev/null; then
    echo -e "${RED}Error: Java no está instalado${NC}"
    echo "Por favor, instala Java JDK 17+ desde https://adoptium.net/"
    exit 1
fi

echo -e "${GREEN}Node.js: $(node --version)${NC}"
echo -e "${GREEN}Java: $(java -version 2>&1 | head -1)${NC}"
echo ""

# Instalar dependencias
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Instalando dependencias del frontend...${NC}"
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}Instalando dependencias del backend...${NC}"
    cd backend && npm install && cd ..
fi

# Generar APK
echo ""
echo -e "${YELLOW}Generando APK...${NC}"
echo ""

cd android

# Limpiar
if [ -d "app/build" ]; then
    echo -e "${YELLOW}Limpiando builds anteriores...${NC}"
    rm -rf app/build
fi

# Compilar
chmod +x gradlew
./gradlew assembleRelease --no-daemon

cd ..

echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}  Proceso completado${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""

if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
    echo -e "${GREEN}[SUCCESS] APK generado correctamente!${NC}"
    echo ""
    echo "Ubicación:"
    echo "android/app/build/outputs/apk/release/app-release.apk"
    echo ""
    
    # Copiar a la raíz
    cp "android/app/build/outputs/apk/release/app-release.apk" "PrecioLuz-v1.0.0.apk"
    echo -e "${GREEN}Copiado como: PrecioLuz-v1.0.0.apk${NC}"
    echo ""
    ls -lh "PrecioLuz-v1.0.0.apk"
else
    echo -e "${RED}[ERROR] No se pudo generar el APK${NC}"
    echo ""
    echo "Revisa los errores anteriores o ejecuta:"
    echo "cd android"
    echo "./gradlew assembleRelease --stacktrace"
    exit 1
fi

echo ""
echo "=========================================="
echo "  Instrucciones de instalación"
echo "=========================================="
echo ""
echo "1. Copia el archivo APK a tu dispositivo Android"
echo "2. En tu teléfono, ve a Ajustes > Seguridad"
echo "3. Activa 'Fuentes desconocidas' o 'Instalar apps desconocidas'"
echo "4. Abre el archivo APK desde el gestor de archivos"
echo "5. Instala la aplicación"
echo ""
echo "La app funcionará sin conexión (datos mock)"
echo "o con conexión para datos reales de REE."
echo ""
