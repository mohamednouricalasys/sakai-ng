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

# Install openssl for self-signed certificates (if needed)
RUN apk add --no-cache openssl

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built files directly from the browser folder
COPY --from=build /app/dist/sakai-ng/browser /usr/share/nginx/html

# Verify files are in place
RUN ls -la /usr/share/nginx/html/ && \
    if [ ! -f /usr/share/nginx/html/index.html ]; then echo "ERROR: index.html not found!"; exit 1; fi

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the environment script
COPY env.sh /
RUN chmod +x /env.sh

# Expose ports 80 and 443
EXPOSE 80 443

# Run the script and then start nginx
CMD ["/env.sh", "nginx", "-g", "daemon off;"]