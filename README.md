# 🏘️ Sistema de Certificados de Residencia - Frontend
### Plataforma SaaS Multi-Tenant para Juntas de Vecinos

## 📋 Descripción
Sistema web que digitaliza el proceso de solicitud, revisión y emisión de 
certificados de residencia para Juntas de Vecinos. Permite gestionar múltiples 
organizaciones vecinales (multi-tenant) desde una única plataforma.

## 🌐 Sistema en Producción
- **Frontend:** https://lilo2023.github.io/frontend_juntavecinos
- **Backend:** https://backend-junta-vecinos.onrender.com

> ⚠️ El backend usa plan gratuito de Render. La primera solicitud puede 
> tardar ~1 minuto mientras el servidor despierta. Las siguientes son inmediatas.

## 🚀 Funcionalidades Principales

### Portal del Vecino
- Formulario de solicitud de certificado de residencia
- Validación de RUT chileno en tiempo real
- Carga de documentos de respaldo (cédula, acreditación de domicilio, 
  comprobante de pago)
- Subida automática de imágenes a Cloudinary
- Asignación automática de número de folio correlativo

### Panel del Operador (Junta de Vecinos)
- Bandeja de entrada con todas las solicitudes en tiempo real
- Visor de evidencias con zoom para revisar documentos
- Flujo de aprobación o rechazo con motivo
- Generación automática de Certificado de Residencia al aprobar
- PDF del certificado almacenado permanentemente en Cloudinary

### Configuración Institucional (Multi-Tenant)
- Panel de configuración por entidad vecinal
- Personalización de cabecera, pie de firma y datos bancarios
- Soporte para múltiples juntas de vecinos simultáneas

## 🛠️ Tecnologías Utilizadas
- **React 19** — Biblioteca de interfaz de usuario
- **JavaScript (ES6+)** — Lenguaje principal
- **GitHub Pages** — Hosting del frontend
- **Cloudinary** — Almacenamiento de imágenes y PDFs en la nube

## 📁 Estructura del Proyecto

### Estructura del Proyecto (Repositorio Frontend)

```text
sistema-junta-vecinos/  (Frontend - React SPA)
├── .github/
│   └── workflows/
│       └── deploy.yml              # Pipeline de CI/CD para despliegue automático en GitHub Pages
├── public/                         # Recursos estáticos públicos de la aplicación
│   ├── demo_cedula.jpg             # Imagen de prueba para Cédula de Identidad (Botón Demo "A")
│   ├── demo_domicilio.pdf          # Certificado PDF de prueba para Domicilio (Botón Demo "A")
│   ├── demo_pago.jpg               # Comprobante de pago de prueba Itaú (Botón Demo "A")
│   ├── favicon.ico / favicon.png   # Iconos institucionales de la pestaña del navegador
│   ├── index.html                  # Plantilla HTML principal de la SPA
│   ├── manifest.json               # Configuración PWA / Web App
│   └── robots.txt                  # Reglas de indexación para buscadores
├── src/                            # Código fuente del proyecto en React
│   ├── components/                 # Componentes de UI genéricos y reutilizables
│   ├── features/                   # Módulos del sistema agrupados por dominio de negocio
│   │   ├── administracion/         # Módulo de administración e institución
│   │   │   └── ConfiguracionJunta.jsx  # Configuración de membrete, firmas y datos bancarios
│   │   ├── autenticacion/          # Módulo de control de acceso e inicio
│   │   │   ├── LandingPage.jsx         # Página principal de presentación de la solución
│   │   │   └── LoginRegister.jsx       # Registro e inicio de sesión de vecinos y directivas
│   │   ├── junta/                  # Módulo del Operador / Junta de Vecinos
│   │   │   ├── DetalleRevision.jsx     # Visor de evidencias con zoom, soporte PDF y emisión
│   │   │   └── PanelAdmin.jsx          # Bandeja de entrada y gestión de solicitudes en tiempo real
│   │   └── vecino/                 # Módulo del Residente / Vecino
│   │       ├── FormularioSolicitud.jsx # Formulario de solicitud de certificado con subida Cloudinary
│   │       ├── IdentificadorJunta.jsx  # Buscador territorial de JJVV por dirección y mapas OSM
│   │       ├── juntasData.js           # Directorio y datos de sedes de las JJVV de Ñuñoa
│   │       ├── MisSolicitudes.jsx      # Portal del vecino para seguimiento y descarga de trámites
│   │       └── nunoaPolygonsData.js    # Polígonos de límites territoriales oficiales de Ñuñoa
│   ├── App.css                     # Estilos globales y layouts de la aplicación
│   ├── App.js                      # Componente raíz: orquestador de estados, rutas y API
│   ├── index.css                   # Resets CSS y reglas globales base
│   ├── index.js                    # Punto de entrada principal de React (ReactDOM.render)
│   ├── reportWebVitals.js          # Medición de métricas de rendimiento web
│   └── setupTests.js               # Configuración inicial para pruebas con Jest
├── nunoa_polygons.kml              # Archivo KML original con polígonos geográficos de Ñuñoa
├── package.json                    # Configuración del proyecto, scripts (build, deploy) y dependencias
├── package-lock.json               # Árbol de versiones bloqueadas de paquetes npm
└── README.md                       # Documentación principal del proyecto
```

### Estructura del Proyecto (Repositorio Backend)

```text
backend-junta-vecinos/  (Backend - Node.js + Express REST API)
├── controllers/                    # Lógica de negocio de la API
│   ├── authController.js           # Autenticación y tokens
│   ├── juntaController.js          # Configuración y datos institucionales
│   ├── residenteController.js      # Gestión de perfil del residente
│   ├── solicitudController.js      # Creación de trámites, estados y generación de PDF (Puppeteer)
│   └── vecinoController.js         # Registro y validación de vecinos
├── models/                         # Modelos de datos Mongoose (MongoDB Atlas)
│   ├── Junta.js                    # Esquema de organización vecinal
│   ├── Residente.js                # Esquema de perfil residente
│   ├── Solicitud.js                # Esquema de trámite de certificado
│   └── Vecino.js                   # Esquema de usuario vecino
├── routes/                         # Definición de rutas y endpoints HTTP REST
│   ├── authRoutes.js               # Endpoints de autenticación (/api/auth)
│   ├── juntaRoutes.js              # Endpoints de juntas (/api/junta)
│   ├── residenteRoutes.js          # Endpoints de residentes (/api/residente)
│   ├── solicitudRoutes.js          # Endpoints de solicitudes (/api/solicitudes)
│   └── vecinoRoutes.js             # Endpoints de vecinos (/api/vecino)
├── tests/                          # Suite de pruebas automatizadas Jest + Supertest
│   ├── mocks/
│   │   └── puppeteerMock.js        # Mock para pruebas sin ejecución real de navegador
│   ├── metricasCuantitativas.test.js
│   ├── solicitud.test.js
│   └── vecino.test.js
├── .env                            # Variables de entorno (puertos, URI MongoDB, Cloudinary)
├── index.js                        # Servidor principal de Express y conexión a MongoDB
├── jest.config.js                  # Configuración del runner de pruebas Jest
└── package.json                    # Dependencias del servidor Node.js
```

## ⚙️ Ejecución Local
```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo (puerto 3001)
npm start
```
> Requiere que el backend esté corriendo en `localhost:5000`

## 🔗 Repositorio Backend
https://github.com/lilo2023/backend-junta-vecinos

# 🚀 Plataforma Web SaaS de Certificados de Residencia para Juntas de Vecinos (Instructivo de Instalación en Ambiente de Desarrollo)

Solución web para la automatización, estandarización y emisión de certificados de residencia en Juntas de Vecinos de Chile (Comuna de Ñuñoa).

---

## 🛠️ Prerrequisitos

Antes de comenzar, asegúrate de tener instalado en tu equipo:

* **[Node.js](https://nodejs.org/)**: Versión `v18.0.0` o superior.
* **[npm](https://www.npmjs.com/)**: Versión `v10.0.0` o superior (incluido con Node.js).
* **[Git](https://git-scm.com/)**: Controlador de versiones.
* **Cuenta en MongoDB Atlas** (Base de datos NoSQL en la nube).
* **Cuenta en Cloudinary** (Almacenamiento de evidencias e imágenes).

---

## 📦 Guía de Instalación en Ambiente de Desarrollo

### 1. Clonar los Repositorios

Abre tu terminal y clona los dos repositorios del proyecto:

```bash
# 1. Clonar Frontend (React SPA)
git clone https://github.com/lilo2023/frontend_juntavecinos.git

# 2. Clonar Backend (Node.js + Express REST API)
git clone https://github.com/lilo2023/backend-junta-vecinos.git
```

---

### 2. Configurar y Ejecutar el Backend (`backend-junta-vecinos`)

1. Entra a la carpeta del backend e instala las dependencias:
   ```bash
   cd backend-junta-vecinos
   npm install
   ```

2. Crea un archivo `.env` en la raíz de `backend-junta-vecinos` con tus credenciales:
   ```env
   # Puerto de ejecución local
   PORT=5000

   # Cadena de conexión a MongoDB Atlas
   MONGO_URI=mongodb+srv://tu_usuario:tu_password@clusterjunta.mongodb.net/test?retryWrites=true&w=majority

   # Credenciales de Cloudinary (Almacenamiento de evidencias y adjuntos)
   CLOUDINARY_CLOUD_NAME=tu_cloud_name
   CLOUDINARY_API_KEY=tu_api_key
   CLOUDINARY_API_SECRET=tu_api_secret
   ```

3. Inicia el servidor de desarrollo del backend:
   ```bash
   npm run dev
   ```
   > 🟢 El servidor backend estará escuchando en: `http://localhost:5000`

---

### 3. Configurar y Ejecutar el Frontend (`sistema-junta-vecinos` / `frontend_juntavecinos`)

1. Entra a la carpeta del frontend e instala las dependencias:
   ```bash
   cd ../frontend_juntavecinos
   npm install
   ```

2. Inicia la aplicación React en modo desarrollo:
   ```bash
   npm start
   ```
   > 🟢 La aplicación web se abrirá automáticamente en tu navegador en: `http://localhost:3000`

---

## 🧪 Verificación del Entorno

1. Abre `http://localhost:3000` en tu navegador.
2. **Prueba Vecino**: Ingresa a "Solicitar Certificado", ingresa una dirección (ej: `Suecia 2655, Ñuñoa`), adjunta archivos de prueba y envía la solicitud.
3. **Prueba Operador JJVV**: Inicia sesión como operador (`jvuniversidad19@gmail.com` / `junta1` o `unioncomunalnunoa@gmail.com` / `junta2`) y verifica que las solicitudes aparezcan en el panel de revisión.

---

## 💻 Stack Tecnológico (MERN Stack)

* **Frontend**: React 19, JavaScript ES6+, HTML5 Geolocation API, CSS3 Vanilla.
* **Backend**: Node.js, Express.js REST API.
* **Base de Datos**: MongoDB Atlas (Mongoose ODM).
* **Servicios Cloud**: Cloudinary (Almacenamiento de evidencias), Puppeteer (Generación de PDF de Certificados).


## 👨‍💻 Autor
Danilo Godoy — Proyecto académico UNAB 2026

