# --- Stage 1: Build the Vue app ---
FROM node:22-alpine AS build
RUN node -v
WORKDIR /app

# Copy dependency manifests first for caching
COPY package*.json ./
RUN npm ci --legacy-peer-deps
RUN npm --registry=https://registry.npmjs.org/ install -g npm-run-all

# Copy source and build
COPY . .
RUN npm run build

# --- Stage 2: Serve the static files with nginx ---
FROM nginx:stable-alpine
# Remove default nginx html files
RUN rm -rf /usr/share/nginx/html/*

# Copy the built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Basic SPA-friendly nginx config
RUN echo 'server { \
  listen 80; \
  server_name _; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { try_files $uri $uri/ /index.html; } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
