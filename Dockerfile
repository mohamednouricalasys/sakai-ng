# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps for PrimeNG compatibility
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built app from build stage to temporary location
COPY --from=build /app/dist /tmp/app-build

# Move content from nested folder structure to nginx html directory
# This handles Angular's browser subfolder automatically
RUN find /tmp/app-build -mindepth 1 -maxdepth 1 -exec mv {} /usr/share/nginx/html/ \; && \
    rm -rf /tmp/app-build

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]