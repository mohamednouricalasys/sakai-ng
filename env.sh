#!/bin/sh
set -e

echo "Generating env.js from environment variables..."

# Recreate config file
rm -f /usr/share/nginx/html/env.js
touch /usr/share/nginx/html/env.js

# Add assignment
echo "window.env = {" >> /usr/share/nginx/html/env.js

# Read each environment variable and write it to the config file
# IMPORTANT: Do NOT include keycloakclientsecret here - secrets should not be exposed to the browser
echo "  keycloakclientId: \"${KEYCLOAK_CLIENT_ID:-angular-dev-client}\"," >> /usr/share/nginx/html/env.js
echo "  keycloakRealm: \"${KEYCLOAK_REALM:-prodigy}\"," >> /usr/share/nginx/html/env.js
echo "  keycloakUrl: \"${KEYCLOAK_URL:-http://localhost:8080}\"," >> /usr/share/nginx/html/env.js
echo "  baseFrontUrl: \"${BASE_FRONT_URL:-https://localhost:4200}\"," >> /usr/share/nginx/html/env.js
echo "  apiUrl: \"${API_URL:-https://localhost:5001/api}\"," >> /usr/share/nginx/html/env.js

# Handle allowedUrls as an array
if [ -n "$ALLOWED_URLS" ]; then
    echo "  allowedUrls: \"${ALLOWED_URLS}\".split(',')," >> /usr/share/nginx/html/env.js
else
    echo "  allowedUrls: [\"localhost\"]," >> /usr/share/nginx/html/env.js
fi

# Handle production as boolean
if [ "$PRODUCTION" = "true" ]; then
    echo "  production: true" >> /usr/share/nginx/html/env.js
else
    echo "  production: false" >> /usr/share/nginx/html/env.js
fi

echo "};" >> /usr/share/nginx/html/env.js

echo "env.js generated successfully:"
cat /usr/share/nginx/html/env.js

# Execute the CMD
exec "$@"