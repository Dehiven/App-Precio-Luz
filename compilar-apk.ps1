$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Precio Luz - Compilando APK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$env:ANDROID_HOME = "C:\Users\carlo\AppData\Local\Android\Sdk"
$env:JAVA_HOME = "D:\Android Studio\jbr"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"

Write-Host "[INFO] Java:" -ForegroundColor Yellow
java -version 2>&1 | Select-Object -First 1
Write-Host ""

Write-Host "[INFO] Android SDK: $env:ANDROID_HOME" -ForegroundColor Yellow
Write-Host "[INFO] Java Home: $env:JAVA_HOME" -ForegroundColor Yellow
Write-Host ""

Set-Location "E:\Proyectos Github\APP Precio Luz\LuzApp\android"

Write-Host "[INFO] Compilando APK..." -ForegroundColor Yellow
Write-Host ""

& .\gradlew.bat assembleRelease --no-daemon

if (Test-Path "app\build\outputs\apk\release\app-release.apk") {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  APK GENERADO CORRECTAMENTE!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    Copy-Item "app\build\outputs\apk\release\app-release.apk" "..\PrecioLuz-v1.0.0.apk" -Force
    
    Write-Host "Ubicacion: E:\Proyectos Github\APP Precio Luz\LuzApp\PrecioLuz-v1.0.0.apk" -ForegroundColor Cyan
    Write-Host ""
    
    $file = Get-Item "..\PrecioLuz-v1.0.0.apk"
    Write-Host "Tamano: $([math]::Round($file.Length / 1MB, 2)) MB" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Instrucciones de instalacion" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Copia 'PrecioLuz-v1.0.0.apk' a tu movil" -ForegroundColor White
    Write-Host "2. En tu movil: Ajustes > Seguridad > Fuentes desconocidas" -ForegroundColor White
    Write-Host "3. Abre el APK y pulsa Instalar" -ForegroundColor White
    Write-Host "4. Disfruta de la app!" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "[ERROR] No se pudo generar el APK" -ForegroundColor Red
    exit 1
}
