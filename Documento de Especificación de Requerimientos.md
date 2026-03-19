# **DOCUMENTO DE ESPECIFICACIÓN DE REQUERIMIENTOS (SRS)**

## **1\. Introducción**

### **1.1 Propósito**

Este documento define de forma detallada los requerimientos funcionales y no funcionales para el desarrollo de una aplicación móvil destinada a mostrar el precio de la electricidad en tiempo real en España, utilizando datos oficiales provenientes de la API de Red Eléctrica Española (REE).

### **1.2 Alcance**

La aplicación permitirá a los usuarios:

* Consultar el precio de la luz en tiempo real.  
* Visualizar gráficos de variación (subidas y bajadas).  
* Consultar precios por horas.  
* Acceder al mercado eléctrico diario.  
* Gestionar electrodomésticos y optimizar el consumo energético.

### **1.3 Definiciones**

* REE: Red Eléctrica Española.  
* API REE: Servicio web oficial que proporciona datos energéticos.  
* Precio por hora: Coste de electricidad segmentado por franjas horarias.

---

## **2\. Descripción General**

### **2.1 Perspectiva del Producto**

Aplicación móvil multiplataforma (iOS y Android) conectada a servicios externos (API REE) para la obtención de datos energéticos en tiempo real.

### **2.2 Funcionalidades Principales**

* Visualización en tiempo real del precio de la luz.  
* Gráficas dinámicas de evolución del precio.  
* Consulta detallada por horas.  
* Consulta del mercado eléctrico diario.  
* Gestión personalizada de electrodomésticos.  
* Cálculo y estimación de gasto energético.

### **2.3 Tipos de Usuarios**

* Usuarios domésticos.  
* Usuarios interesados en ahorro energético.

---

## **3\. Requerimientos Funcionales**

### **3.1 Precio de la Luz en Tiempo Real**

* RF1.1: La aplicación debe mostrar el precio actual de la luz obtenido desde la API de REE.  
* RF1.2: El sistema debe actualizar los datos automáticamente cada 5 minutos (configurable).  
* RF1.3: El precio debe mostrarse en €/kWh.

### **3.2 Visualización de Gráficas**

* RF2.1: La aplicación debe mostrar gráficos interactivos del precio de la luz.  
* RF2.2: Se debe representar la evolución del precio durante el día.  
* RF2.3: Debe diferenciar visualmente subidas y bajadas.  
* RF2.4: Permitir visualización por día, semana y mes.

### **3.3 Consulta por Horas**

* RF3.1: El usuario podrá consultar el precio de la luz por cada hora del día.  
* RF3.2: El sistema destacará automáticamente las horas más económicas.  
* RF3.3: El sistema destacará las horas más caras.

### **3.4 Mercado Eléctrico Diario**

* RF4.1: La aplicación mostrará el mercado eléctrico diario obtenido desde la API de REE.  
* RF4.2: Permitirá consultar datos históricos.  
* RF4.3: Mostrará resumen diario (precio medio, mínimo y máximo).

### **3.5 Gestión de Electrodomésticos**

* RF5.1: El usuario podrá añadir electrodomésticos manualmente.  
* RF5.2: Podrá asignar consumo estimado (kWh).  
* RF5.3: Podrá programar horarios de uso.  
* RF5.4: La app sugerirá las mejores horas para su uso según precios.

### **3.6 Gestión y Estimación de Consumo**

* RF6.1: La aplicación calculará el coste estimado de uso por electrodoméstico.  
* RF6.2: Mostrará el gasto total diario estimado.  
* RF6.3: Generará recomendaciones automáticas de ahorro.

### **3.7 Notificaciones (Opcional)**

* RF7.1: Enviar alertas cuando el precio sea bajo.  
* RF7.2: Enviar alertas cuando el precio sea alto.

---

## **4\. Requerimientos No Funcionales**

### **4.1 Rendimiento**

* RNF1.1: Tiempo de respuesta inferior a 2 segundos.  
* RNF1.2: Consumo eficiente de batería.

### **4.2 Usabilidad**

* RNF2.1: Interfaz moderna, clara e intuitiva.  
* RNF2.2: Experiencia optimizada para móviles.

### **4.3 Seguridad**

* RNF3.1: Comunicación segura mediante HTTPS.  
* RNF3.2: Protección de datos del usuario.

### **4.4 Disponibilidad**

* RNF4.1: Disponibilidad del sistema ≥ 99%.

### **4.5 Escalabilidad**

* RNF5.1: El sistema debe soportar crecimiento de usuarios sin degradación significativa.

---

## **5\. Requerimientos Técnicos**

### **5.1 Arquitectura**

* Frontend: Aplicación móvil (Flutter o React Native).  
* Backend: API REST para procesamiento y cacheo de datos.  
* Base de datos: PostgreSQL o MongoDB.

### **5.2 Integración con API REE**

* RT1: El sistema debe consumir datos desde la API oficial de REE.  
* RT2: Debe implementar cacheo para optimizar llamadas.  
* RT3: Manejo de errores ante caídas de la API.

### **5.3 Procesamiento de Datos**

* Cálculo de medias, mínimos y máximos.  
* Normalización de datos horarios.

---

## **6\. Casos de Uso**

### **CU1: Consultar precio actual**

Actor: Usuario Flujo: El usuario abre la app y visualiza el precio actual en tiempo real.

### **CU2: Ver precios por horas**

Actor: Usuario Flujo: El usuario accede a la vista diaria y consulta precios por hora.

### **CU3: Ver gráfica**

Actor: Usuario Flujo: El usuario visualiza la evolución del precio.

### **CU4: Añadir electrodoméstico**

Actor: Usuario Flujo: Introduce nombre, consumo y horario.

### **CU5: Obtener recomendaciones**

Actor: Usuario Flujo: La app sugiere horas óptimas de uso.

---

## **7\. Requisitos de Interfaz**

* Dashboard principal con precio actual destacado.  
* Gráficas interactivas.  
* Vista calendario/horaria.  
* Panel de gestión de electrodomésticos.

---

## **8\. Futuras Mejoras**

* Integración con dispositivos IoT.  
* Automatización del encendido de electrodomésticos.  
* Predicción de precios mediante IA.

---

## **9\. Criterios de Aceptación**

* Los datos deben coincidir con los proporcionados por REE.  
* La app debe ser estable y sin errores críticos.  
* La experiencia de usuario debe ser fluida.

