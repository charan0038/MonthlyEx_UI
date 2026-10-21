# Stage 1: Build the React application
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies using clean install
COPY package*.json ./
RUN npm ci

# Pass API Base URL at build time (defaults to production Render API)
ARG VITE_API_BASE_URL=https://monthlyex-api.onrender.com/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy source code and build production bundle
COPY . .
RUN npm run build

# Stage 2: Serve using high-performance, lightweight Nginx
FROM nginx:alpine AS production

# Copy custom Nginx configuration with Single Page Application (SPA) routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled assets from build stage to Nginx public webroot
COPY --from=build /app/dist /usr/share/nginx/html

# Expose HTTP port 80
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
