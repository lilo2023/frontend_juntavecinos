# ==========================================
# DOCKERFILE - FRONTEND REACT (Multi-Stage Build + Nginx)
# ==========================================

# --- ETAPA 1: Compilación del código React ---
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar manifiesto e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar código fuente y compilar bundle optimizado
COPY . .
RUN npm run build

# --- ETAPA 2: Servidor de producción ultra ligero Nginx ---
FROM nginx:alpine

# Copiar la compilación de React al directorio público de Nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Exponer el puerto 80 del servidor web Nginx
EXPOSE 80

# Comando por defecto para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
