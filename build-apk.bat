@echo off
chcp 65001 >nul
REM ========================================
REM   Precio Luz - Build APK Standalone
REM ========================================
echo.
echo ========================================
echo   Precio Luz - Generando APK
echo ========================================
echo.

REM Verificar Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado
    echo Por favor, instala Node.js desde https://nodejs.org/
    exit /b 1
)

REM Verificar Java
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Java no esta instalado
    echo Por favor, instala Java JDK 17+ desde https://adoptium.net/
    exit /b 1
)

REM Verificar Android SDK
if not exist "%ANDROID_HOME%\platforms" (
    if not exist "%LOCALAPPDATA%\Android\Sdk\platforms" (
        echo [ERROR] Android SDK no encontrado
        echo Por favor, instala Android Studio desde https://developer.android.com/studio
        exit /b 1
    )
)

echo [INFO] Node.js:
node --version
echo.
echo [INFO] Java:
java -version 2>&1 | findstr /i "version"
echo.

REM Instalar dependencias
if not exist "node_modules" (
    echo [INFO] Instalando dependencias...
    call npm install
)

if not exist "backend\node_modules" (
    echo [INFO] Instalando dependencias del backend...
    cd backend
    call npm install
    cd ..
)

REM Generar APK
echo.
echo [INFO] Generando APK...
echo.

cd android

REM Limpiar builds anteriores
if exist "app\build" (
    echo [INFO] Limpiando builds anteriores...
    rmdir /s /q app\build 2>nul
)

REM Compilar APK
call gradlew.bat assembleRelease --no-daemon

cd ..

echo.
echo ========================================
echo   Proceso completado
echo ========================================
echo.

if exist "android\app\build\outputs\apk\release\app-release.apk" (
    echo [SUCCESS] APK generado correctamente!
    echo.
    echo Ubicacion:
    echo android\app\build\outputs\apk\release\app-release.apk
    echo.
    
    REM Copiar a la raiz
    copy "android\app\build\outputs\apk\release\app-release.apk" "PrecioLuz-v1.0.0.apk"
    echo.
    echo Copiado como: PrecioLuz-v1.0.0.apk
    echo.
    dir "PrecioLuz-v1.0.0.apk"
) else (
    echo [ERROR] No se pudo generar el APK
    echo.
    echo Revisa los errores anteriores o ejecuta:
    echo cd android
    echo gradlew.bat assembleRelease --stacktrace
    exit /b 1
)

echo.
echo ========================================
echo   Instrucciones de instalacion
echo ========================================
echo.
echo 1. Copia el archivo APK a tu dispositivo Android
echo 2. En tu telefono, ve a Ajustes > Seguridad
echo 3. Activa "Fuentes desconocidas" o "Instalar apps desconocidas"
echo 4. Abre el archivo APK desde el gestor de archivos
echo 5. Instala la aplicacion
echo.
echo La app funcionara sin conexion (datos mock)
echo o con conexion para datos reales de REE.
echo.
pause
