---
name: design-system
description: Guía y reglas del Design System oficial de la Plataforma SaaS de Juntas de Vecinos. Utilizar obligatoriamente al crear o modificar componentes de UI.
---

# 🎨 Design System - Guía de Estilos y Componentes de UI

Cualquier nuevo componente o modificación visual en el proyecto `sistema-junta-vecinos` debe respetar estrictamente los tokens y reglas estandarizadas de este Design System.

## 1. Tokens de Diseño (CSS Variables)

- **Color Primario (Institucional):** `--color-primary: #0369a1`
- **Color Éxito (Confirmaciones/Boton Aprobado):** `--color-success: #28a745`
- **Color Peligro (Rechazo/Errores):** `--color-danger: #dc3545`
- **Color Advertencia (Alertas/Banco):** `--color-warning: #dd6b20`
- **Color Fondo Tarjeta:** `--color-bg-card: #ffffff`
- **Color Fondo Secciones:** `--color-bg-light: #f0f9ff`
- **Bordes Redondeados:**
  - Tarjetas y contenedores: `--radius-lg: 12px`
  - Botones y campos de texto: `--radius-md: 8px`
  - Badges y etiquetas: `--radius-pill: 9999px`
- **Sombras:** `--shadow-card: 0 2px 5px rgba(0, 0, 0, 0.03)`, `--shadow-btn: 0 2px 6px rgba(0, 0, 0, 0.12)`

## 2. Componentes Base Estandarizados (`src/components/`)

- **`<Boton />`**: Utilizar variaciones `variant="primary"`, `variant="success"`, `variant="danger"`. Soporta prop `loading={true}` para mostrar spinner animado.
- **`<Tarjeta />`**: Utilizar para agrupar secciones o formularios con fondo blanco, bordes redondeados de 12px y sombra sutil.
- **`<Alerta />`**: Utilizar para banners informativos con fondo azul/naranja claro e iconos expresivos.

## 3. Reglas para los Agentes de IA

1. NO usar colores arbitrarios o no definidos (como rojos chillones o verdes puros `rgb(0,255,0)`).
2. Priorizar el uso de las variables CSS de `src/styles/designSystem.css` o los componentes base de `src/components/`.
3. Mantener tipografía responsiva y layouts limpios basados en CSS Flexbox / CSS Grid.
