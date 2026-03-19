@echo off
chcp 65001 >nul
REM ========================================
REM   Precio Luz - Test de API
REM ========================================
echo.
echo ========================================
echo   Precio Luz - Test de API REE
echo ========================================
echo.

REM Probar API de REE
echo [1] Probando conexion con API de REE...
echo.

powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://api.esios.ree.es/indicators/1001' -Headers @{'Accept'='application/json'; 'Content-Type'='application/json'; 'Authorization'='Token token=\"53bdkj56df7fg98dfg7s8dfg7sdfgs5df6gs5df6g\"'} -TimeoutSec 10 -UseBasicParsing; Write-Host '[SUCCESS] API de REE accesible' -ForegroundColor Green; Write-Host 'Status:' $response.StatusCode } catch { Write-Host '[INFO] API de REE no disponible (necesita token valido)' -ForegroundColor Yellow; Write-Host 'La app usara datos mock realistas' -ForegroundColor Cyan }"

echo.
echo [2] Verificando configuracion de red...
echo.

REM Verificar conexion a internet
powershell -Command "try { Test-NetConnection -ComputerName api.esios.ree.es -Port 443 -WarningAction SilentlyContinue | Select-Object TcpTestSucceeded | Out-String } catch { Write-Host 'No se pudo verificar la conexion' }"

echo.
echo ========================================
echo   Resumen
echo ========================================
echo.
echo La aplicacion Precio Luz funciona de dos maneras:
echo.
echo 1. CON DATOS REALES:
echo    - Necesitas un token valido de REE
echo    - Obtenlo en: https://www.ree.es/es/apidatos
echo    - Edita src/services/api.ts y reemplaza el token
echo.
echo 2. CON DATOS MOCK (Funciona siempre):
echo    - La app genera datos realistas automaticamente
echo    - No requiere conexion a internet para funcionar
echo    - Incluye variaciones horarias reales
echo    - Diferencia entre dias laborables y fines de semana
echo.
echo.
echo [3] Para probar la app, genera el APK:
echo.
echo    npm run build:android
echo.
echo o usa:
echo.
echo    build-apk.bat
echo.
pause
