# Precio Luz App - Setup Script

echo ==========================================
echo   Precio Luz - Configuracion Inicial
echo ==========================================
echo.

# Colores para Windows
set GREEN=[92m
set YELLOW=[93m
set RED=[91m
set NC=[0m

echo Instalando dependencias del frontend...
call npm install
if %errorlevel% neq 0 (
    echo Error instalando dependencias del frontend
    exit /b 1
)
echo.

echo Instalando dependencias del backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Error instalando dependencias del backend
    exit /b 1
)
cd ..
echo.

echo.
echo ==========================================
echo   Configuracion completada!
echo ==========================================
echo.
echo Para ejecutar la aplicacion:
echo.
echo   Modo desarrollo completo (backend + frontend):
echo   npm run dev
echo.
echo   Solo frontend (con datos de prueba):
echo   npm start
echo.
echo   Compilar APK de debug:
echo   build-android.bat
echo.
echo Para usar datos reales de la API de REE:
echo 1. Obtener token en https://www.ree.es/es/apidatos
echo 2. Editar backend/.env y añadir el token
echo.
pause
