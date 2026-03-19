# Guía Completa - Precio Luz App

## Quick Start (5 minutos)

### Opción 1: Probar en tu móvil ahora

1. **Descarga Expo Go** en tu móvil:
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. **Abre la app** y escanea este QR (necesitas ejecutar `npm start` primero):

```bash
cd LuzApp
npm install
npm start
```

### Opción 2: Generar APK para instalación directa

```bash
cd LuzApp
build-apk.bat
```

Esto generará `PrecioLuz-v1.0.0.apk` que puedes instalar en tu móvil.

---

## Cómo Funciona la App

### Sin internet
La app usa **datos mock realistas** que simulan los precios reales:
- Variaciones horarias (más caro 18-22h, más barato 2-6h)
- Precios diferentes en fines de semana
- Datos similares a PVPC real

### Con internet
La app se conecta a la **API de Red Eléctrica Española (REE)** para datos reales:
- Endpoint: `https://api.esios.ree.es/indicators/1001`
- Actualización: Cada 5 minutos
- Solo necesita token de API

---

## Obtener Token de API de REE (Opcional)

Para datos 100% reales:

1. Ve a: https://www.ree.es/es/apidatos
2. Regístrate/Inicia sesión
3. Ve a "Acceso API"
4. Copia tu token
5. Edita `src/services/api.ts` línea 4:
   ```typescript
   const REE_API_TOKEN = 'TU_TOKEN_AQUI';
   ```

---

## Estructura de la App

```
LuzApp/
├── App.tsx              # Pantalla principal
├── src/
│   ├── screens/         # 5 pantallas
│   │   ├── HomeScreen.tsx        # Precio actual
│   │   ├── GraphScreen.tsx       # Gráficos
│   │   ├── AppliancesScreen.tsx  # Electrodomésticos
│   │   ├── CalendarScreen.tsx    # Calendario
│   │   └── MenuScreen.tsx       # Menú
│   ├── components/      # Componentes UI
│   │   ├── PriceCard.tsx         # Tarjeta de precio
│   │   ├── PriceChart.tsx       # Gráfico
│   │   └── ...
│   ├── services/
│   │   └── api.ts      # Conexión API REE
│   └── context/
│       └── AppContext.tsx       # Estado global
```

---

## Resolver Problemas

### "No puedo compilar el APK"
Asegúrate de tener:
- Node.js 18+: https://nodejs.org/
- Java JDK 17+: https://adoptium.net/
- Android Studio: https://developer.android.com/studio

### "La app no conecta a internet"
1. Verifica los permisos en AndroidManifest.xml
2. Asegúrate de que `android:usesCleartextTraffic="true"` está presente
3. Verifica que `INTERNET` permission está añadida

### "Los datos no se actualizan"
- La app actualiza automáticamente cada 5 minutos
- Pull-to-refresh en la pantalla principal
- Revisa el menú > Actualizar datos

### "Quiero datos reales de REE"
1. Obtén token en https://www.ree.es/es/apidatos
2. Edita `src/services/api.ts`
3. Recompila el APK

---

## Comandos Útiles

```bash
# Instalar todo
npm install

# Ejecutar en desarrollo
npm start

# Generar APK
build-apk.bat

# Verificar errores TypeScript
npm run typecheck

# Prebuild Android
npx expo prebuild --platform android
```

---

## Tecnologías

- **Framework**: React Native + Expo SDK 55
- **Estado**: React Context + AsyncStorage
- **Navegación**: React Navigation
- **API**: Red Eléctrica Española (REE)
- **Mock Data**: Generador de precios realistas

---

## Licencia

MIT License - Libre para usar y modificar
