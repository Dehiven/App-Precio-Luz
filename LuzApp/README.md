# Precio Luz - App de Precios de Electricidad en España

Aplicación móvil desarrollada con React Native (Expo) para consultar el precio de la electricidad en tiempo real en España.

**Funciona de forma 100% independiente** - No necesita servidor backend. Incluye datos realistas y se conecta directamente a la API de Red Eléctrica Española (REE).

## Características

- **Precio en tiempo real**: Consulta el precio actual de la luz
- **Gráficos interactivos**: Visualiza la evolución del precio con gráficos dinámicos
- **Precios por hora**: Consulta el precio de la luz para cada hora del día
- **Calendario**: Navega por fechas anteriores y consulta precios históricos
- **Gestión de electrodomésticos**: Añade tus aparatos eléctricos y calcula su coste de consumo
- **Recomendaciones**: Obtén las mejores horas para consumir energía
- **Funciona offline**: Incluye datos mock realistas para uso sin conexión

## Descargar APK Directo

El APK listo para instalar está disponible en:
**Releases de GitHub**: https://github.com/Dehiven/App-Precio-Luz/releases

## Instalación desde APK

1. Descarga el archivo `PrecioLuz-v1.0.0.apk` desde la sección de Releases
2. En tu dispositivo Android:
   - Ve a **Ajustes > Seguridad**
   - Activa **"Fuentes desconocidas"** o **"Instalar apps desconocidas"**
3. Abre el archivo APK con tu gestor de archivos
4. Toca **Instalar**
5. ¡Listo! Abre la app y disfruta

## Construir APK desde Código Fuente

### Requisitos

- **Node.js** 18+ (https://nodejs.org/)
- **Java JDK** 17+ (https://adoptium.net/)
- **Android Studio** con SDK de Android (https://developer.android.com/studio)

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/Dehiven/App-Precio-Luz.git
cd App-Precio-Luz/LuzApp
```

2. **Instalar dependencias**
```bash
npm install
cd backend && npm install && cd ..
```

3. **Generar archivos nativos de Android**
```bash
npx expo prebuild --platform android
```

4. **Compilar APK**
```bash
# Windows
build-apk.bat

# Mac/Linux
chmod +x build-apk.sh
./build-apk.sh
```

5. El APK se generará en:
   - `android/app/build/outputs/apk/release/app-release.apk`
   - Copiado como: `PrecioLuz-v1.0.0.apk`

## Compilación Manual (Android Studio)

1. Abre Android Studio
2. File > Open > Selecciona la carpeta `android`
3. Espera a que Gradle sincronice
4. Ve a Build > Generate Signed Bundle / APK
5. Selecciona APK > Release
6. Si no tienes keystore, usa la configuración de debug:
   - Keystore: `android/app/debug.keystore`
   - Password: `android`
   - Alias: `androiddebugkey`
   - Password: `android`
7. Build > Build APK(s)

## Estructura del Proyecto

```
LuzApp/
├── App.tsx                    # Componente principal
├── src/
│   ├── components/           # Componentes UI
│   │   ├── AddApplianceModal.tsx
│   │   ├── ApplianceItem.tsx
│   │   ├── HourlyPriceList.tsx
│   │   ├── PriceCard.tsx
│   │   └── PriceChart.tsx
│   ├── context/              # Estado global
│   │   └── AppContext.tsx
│   ├── screens/             # Pantallas
│   │   ├── AppliancesScreen.tsx
│   │   ├── CalendarScreen.tsx
│   │   ├── GraphScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   └── MenuScreen.tsx
│   ├── services/           # Servicios API
│   │   └── api.ts          # API independiente (sin backend)
│   └── types/              # Tipos TypeScript
│       └── index.ts
├── android/                 # Archivos nativos Android
├── backend/                 # Backend opcional (para datos reales)
└── assets/                 # Iconos y recursos
```

## Cómo Funciona la App

### Sin conexión a internet
La app usa datos mock realistas que simulan los precios reales de la luz, incluyendo:
- Variaciones horarias (más caro en horas pico)
- Precios diferentes entre días laborables y fines de semana
- Datos actualizados automáticamente

### Con conexión a internet
La app se conecta directamente a la API de Red Eléctrica Española (REE) para obtener precios reales:
- https://api.esios.ree.es/indicators/1001

## API de Datos

La app consume directamente la API pública de REE:
- **Endpoint**: `https://api.esios.ree.es/indicators/1001/values`
- **Datos**: Precios PVPC (Precio Voluntario para el Pequeño Consumidor)
- **Actualización**: Cada 5 minutos

## Backend Opcional

El proyecto incluye un backend Node.js en la carpeta `backend/` que:
- Hace cache de los datos de REE
- Proporciona una API REST local
- Es útil si quieres desplegar tu propio servidor

### Ejecutar backend
```bash
cd backend
npm start
# Server en http://localhost:5000
```

## Tecnologías Utilizadas

- **Frontend**: React Native + Expo SDK 55
- **Estado**: React Context + AsyncStorage
- **Navegación**: React Navigation
- **Gráficos**: React Native (nativo)
- **API de datos**: Red Eléctrica Española (REE)
- **Backend (opcional)**: Node.js + Express

## Licencia

MIT License

## Autor

Dehiven Code - 2026
