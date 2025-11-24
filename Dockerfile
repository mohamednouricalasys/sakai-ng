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

# Expose port 80
EXPOSE 80

# First, run the environment script, then start nginx in the foreground.
# Using `&&` ensures that nginx only starts if the script succeeds.
CMD /env.sh && nginx -g 'daemon off;'