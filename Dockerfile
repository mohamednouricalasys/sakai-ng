FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:alpine
# Copie les fichiers de build dans un emplacement temporaire
COPY --from=build /app/dist /tmp/app-build
# Déplace le contenu du dossier de build (qu'il soit dans un sous-dossier ou non) vers le répertoire web de Nginx
RUN find /tmp/app-build -mindepth 1 -maxdepth 1 -exec mv {} /usr/share/nginx/html/ \; && rm -rf /tmp/app-build
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]