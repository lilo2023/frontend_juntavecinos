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

## 👨‍💻 Autor
Danilo Godoy — Proyecto académico UNAB 2026

