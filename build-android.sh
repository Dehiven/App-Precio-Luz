#!/bin/bash

echo "========================================"
echo "  Precio Luz - Script de Build"
echo "========================================"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js no está instalado${NC}"
    exit 1
fi

# Verificar Java
if ! command -v java &> /dev/null; then
    echo -e "${RED}Error: Java no está instalado${NC}"
    echo -e "${YELLOW}Por favor, instala Java JDK 17+ para compilar el APK${NC}"
    exit 1
fi

echo -e "${GREEN}Node.js: $(node --version)${NC}"
echo -e "${GREEN}Java: $(java -version 2>&1 | head -1)${NC}"
echo ""

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Instalando dependencias del frontend...${NC}"
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}Instalando dependencias del backend...${NC}"
    cd backend && npm install && cd ..
fi

# Generar archivos nativos si no existen
if [ ! -d "android" ]; then
    echo -e "${YELLOW}Generando archivos nativos de Android...${NC}"
    npx expo prebuild --platform android
fi

# Compilar APK
echo -e "${YELLOW}Compilando APK de debug...${NC}"
cd android

if command -v ./gradlew &> /dev/null; then
    ./gradlew assembleDebug
else
    gradlew.bat assembleDebug
fi

cd ..

# Verificar resultado
if [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  APK generado correctamente!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "Ubicación: android/app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    ls -lh android/app/build/outputs/apk/debug/app-debug.apk
else
    echo -e "${RED}Error: No se pudo generar el APK${NC}"
    exit 1
fi
