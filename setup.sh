#!/bin/bash

echo "=========================================="
echo "  Precio Luz - Configuracion Inicial"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Instalando dependencias del frontend...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}Error instalando dependencias del frontend${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}Instalando dependencias del backend...${NC}"
cd backend
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}Error instalando dependencias del backend${NC}"
    exit 1
fi
cd ..
echo ""

echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}  Configuracion completada!${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo "Para ejecutar la aplicacion:"
echo ""
echo "  Modo desarrollo completo (backend + frontend):"
echo "  npm run dev"
echo ""
echo "  Solo frontend (con datos de prueba):"
echo "  npm start"
echo ""
echo "  Compilar APK de debug:"
echo "  ./build-android.sh"
echo ""
echo "Para usar datos reales de la API de REE:"
echo "1. Obtener token en https://www.ree.es/es/apidatos"
echo "2. Editar backend/.env y anadir el token"
echo ""
