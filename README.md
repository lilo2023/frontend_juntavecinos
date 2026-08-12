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
src/

├── features/

│   ├── vecino/

│   │   └── FormularioSolicitud.jsx    # Portal del vecino

│   ├── junta/

│   │   ├── PanelAdmin.jsx             # Bandeja de entrada operador

│   │   └── DetalleRevision.jsx        # Visor de evidencias y certificado

│   └── administracion/

│       └── ConfiguracionJunta.jsx     # Panel de configuración

└── App.js                             # Orquestador principal

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

##Instructivo de Instalación en Ambiente de Desarrollo
Guía de despliegue local de la solución MERN (Frontend React + Backend Node.js + MongoDB Atlas).
1. Prerrequisitos del Sistema (Bloque Superior)
Node.js: Versión v18+ o v20+ y gestor de paquetes npm (v10+).
Git: Controlador de versiones.
Cuentas Cloud: MongoDB Atlas (Base de datos NoSQL) y Cloudinary (Almacenamiento multimedia).
2. Paso a Paso de Instalación Local (4 Pasos en Cuadrícula / Flujo)
Paso 1: Clonar Repositorios (GitHub)
git clone https://github.com/lilo2023/frontend_juntavecinos.git
git clone https://github.com/lilo2023/backend-junta-vecinos.git
Paso 2: Configurar y Levantar Backend (Node.js + Express)
cd backend-junta-vecinos
npm install
npm run dev   # Inicia el servidor API REST en http://localhost:5000
Configurar variables de entorno (.env): PORT=5000, MONGO_URI, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.
Paso 3: Configurar y Levantar Frontend (React 19)
cd sistema-junta-vecinos
npm install
npm start     # Inicia la interfaz web en http://localhost:3000
Paso 4: Verificación y Pruebas Locales
Abrir el navegador en http://localhost:3000.
Probar el formulario del vecino y el panel del operador conectándose al backend en puerto 5000 y a MongoDB Atlas.
3. Arquitectura del Ambiente de Desarrollo (Diagrama Simplificado)
   [ NAVEGADOR WEB ] ──────> [ FRONTEND REACT ] (Puerto 3000)
                              │
                              ▼ (API REST / JSON)
                          [ BACKEND NODE.JS ] (Puerto 5000)
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
       [ MONGODB ATLAS ]             [ CLOUDINARY ]
     (Base de Datos Cloud)        (Imágenes y Adjuntos)


## 👨‍💻 Autor
Danilo Godoy — Proyecto académico UNAB 2026

