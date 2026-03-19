@echo off
REM Precio Luz - Build Script for Windows

echo ========================================
echo   Precio Luz - Build APK
echo ========================================
echo.

REM Verificar Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js no esta instalado
    exit /b 1
)

REM Verificar Java
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Java no esta instalado
    echo Por favor, instala Java JDK 17+ para compilar el APK
    exit /b 1
)

echo Node.js version:
node --version
echo.
echo Java version:
java -version 2>&1 | findstr /i "version"
echo.

REM Instalar dependencias si es necesario
if not exist "node_modules" (
    echo Instalando dependencias del frontend...
    call npm install
)

if not exist "backend\node_modules" (
    echo Instalando dependencias del backend...
    cd backend
    call npm install
    cd ..
)

REM Generar archivos nativos si no existen
if not exist "android" (
    echo Generando archivos nativos de Android...
    call npx expo prebuild --platform android
)

REM Compilar APK
echo Compilando APK de debug...
cd android
call gradlew.bat assembleDebug
cd ..

REM Verificar resultado
if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    echo.
    echo ========================================
    echo   APK generado correctamente!
    echo ========================================
    echo.
    echo Ubicacion: android\app\build\outputs\apk\debug\app-debug.apk
    echo.
    dir android\app\build\outputs\apk\debug\app-debug.apk
) else (
    echo Error: No se pudo generar el APK
    exit /b 1
)
