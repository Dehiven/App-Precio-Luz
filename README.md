# Precio Luz - App de Precios de Electricidad en España

Aplicación móvil desarrollada con React Native (Expo) para consultar el precio de la electricidad en tiempo real en España, utilizando datos oficiales de Red Eléctrica Española (REE).

## Características

- **Precio en tiempo real**: Consulta el precio actual de la luz actualizado cada 5 minutos
- **Gráficos interactivos**: Visualiza la evolución del precio con gráficos dinámicos
- **Precios por hora**: Consulta el precio de la luz para cada hora del día
- **Calendario**: Navega por fechas anteriores y consulta precios históricos
- **Gestión de electrodomésticos**: Añade tus aparatos eléctricos y calcula su coste de consumo
- **Recomendaciones**: Obtén las mejores horas para consumir energía

## Requisitos

- Node.js 18+ 
- npm o yarn
- Java JDK 17+ (para compilar Android)
- Android Studio con SDK de Android (para compilar APK)
- Backend Node.js (incluido)

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd APP-Precio-Luz/LuzApp
```

### 2. Instalar dependencias del frontend

```bash
npm install
```

### 3. Instalar dependencias del backend

```bash
cd backend
npm install
cd ..
```

### 4. Configurar el backend (opcional)

Para usar datos reales de la API de REE:

```bash
cd backend
cp .env.example .env
# Editar .env y añadir tu token de la API de REE
```

Obtén tu token en: https://www.ree.es/es/apidatos

## Ejecutar la aplicación

### Modo desarrollo (frontend + backend)

```bash
npm run dev
```

Esto ejecutará:
- Backend en http://localhost:5000
- Frontend Expo en http://localhost:8081

### Solo frontend (con datos mock)

```bash
npm start
```

## Compilar APK para Android

### Opción 1: Compilar APK de debug

```bash
npm run build:android:debug
```

Esto generará un APK en: `android/app/build/outputs/apk/debug/app-debug.apk`

### Opción 2: Compilar APK de release

```bash
npm run build:android
```

### Opción 3: Usando Android Studio

1. Abre Android Studio
2. File > Open > Selecciona la carpeta `android`
3. Espera a que Gradle sincronice
4. Run > Build Bundle(s) / APK(s) > Build APK(s)

## Estructura del proyecto

```
LuzApp/
├── App.tsx                 # Componente principal
├── src/
│   ├── components/        # Componentes reutilizables
│   │   ├── AddApplianceModal.tsx
│   │   ├── ApplianceItem.tsx
│   │   ├── HourlyPriceList.tsx
│   │   ├── PriceCard.tsx
│   │   └── PriceChart.tsx
│   ├── context/           # Context API
│   │   └── AppContext.tsx
│   ├── screens/           # Pantallas de la app
│   │   ├── AppliancesScreen.tsx
│   │   ├── CalendarScreen.tsx
│   │   ├── GraphScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   └── MenuScreen.tsx
│   ├── services/          # Servicios API
│   │   └── api.ts
│   └── types/             # Tipos TypeScript
│       └── index.ts
├── backend/                # Backend Node.js
│   ├── server.js          # Servidor Express
│   └── package.json
├── android/                # Archivos nativos Android (generado por Expo)
└── assets/                # Recursos gráficos
```

## API del Backend

El backend proporciona los siguientes endpoints:

- `GET /health` - Estado del servidor
- `GET /prices/today` - Precios del día actual
- `GET /prices?date=YYYY-MM-DD` - Precios de una fecha específica
- `GET /refresh` - Forzar actualización de cache

## Tecnologías utilizadas

- **Frontend**: React Native + Expo
- **Backend**: Node.js + Express
- **Navegación**: React Navigation
- **Estado**: React Context + AsyncStorage
- **API de datos**: Red Eléctrica Española (REE)

## Licencia

MIT License

## Autor

Dehiven Code - 2026
