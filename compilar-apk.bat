@echo off
chcp 65001 >nul
setlocal

REM ========================================
REM   Precio Luz - Compilar APK
REM ========================================
echo.
echo ========================================
echo   Generando APK de Precio Luz
echo ========================================
echo.

REM Configurar variables de entorno
set ANDROID_HOME=D:\Android Studio\sdk
set JAVA_HOME=D:\Android Studio\jbr
set PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%

echo [INFO] Java:
java -version 2>&1 | findstr /i "version"
echo.

echo [INFO] Android SDK: %ANDROID_HOME%
echo [INFO] Java Home: %JAVA_HOME%
echo.

REM Verificar Android SDK
if not exist "%ANDROID_HOME%\platforms" (
    echo [ERROR] No se encontro Android SDK
    echo Busca en: %ANDROID_HOME%
    pause
    exit /b 1
)

REM Ir al directorio del proyecto
cd /d "E:\Proyectos Github\APP Precio Luz\LuzApp"

REM Verificar node_modules
if not exist "node_modules" (
    echo [INFO] Instalando dependencias...
    call npm install
)

REM Ir a android y compilar
cd android

echo.
echo [INFO] Compilando APK...
echo.

call gradlew.bat assembleRelease --no-daemon

cd ..

echo.
echo ========================================
echo   Resultado
echo ========================================
echo.

if exist "android\app\build\outputs\apk\release\app-release.apk" (
    echo [SUCCESS] APK generado correctamente!
    echo.
    copy "android\app\build\outputs\apk\release\app-release.apk" "PrecioLuz-v1.0.0.apk" /Y
    echo [SUCCESS] Copiado a: PrecioLuz-v1.0.0.apk
    echo.
    dir "PrecioLuz-v1.0.0.apk"
    echo.
    echo ========================================
    echo   Instalacion en movil
    echo ========================================
    echo.
    echo 1. Copia PrecioLuz-v1.0.0.apk a tu movil
    echo 2. En tu movil: Ajustes > Seguridad > Fuentes desconocidas
    echo 3. Abre el APK y pulsa Instalar
    echo 4. Disfruta de la app con datos reales!
    echo.
) else (
    echo [ERROR] No se pudo generar el APK
    echo.
    echo Solucion: Ejecuta estos comandos manualmente:
    echo cd android
    echo gradlew.bat assembleRelease --stacktrace
    echo.
)

echo.
pause
