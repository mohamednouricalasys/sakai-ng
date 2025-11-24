#!/bin/sh
set -e

# Recreate config file
rm -f /usr/share/nginx/html/env.js
touch /usr/share/nginx/html/env.js

# Add assignment
echo "window.env = {" >> /usr/share/nginx/html/env.js

# Read each environment variable and write it to the config file
# Fallback to a default value if the variable is not set
echo "  keycloakclientId: \"${KEYCLOAK_CLIENT_ID:-angular-dev-client}\"," >> /usr/share/nginx/html/env.js
echo "  keycloakclientsecret: \"${KEYCLOAK_CLIENT_SECRET:-GruYchA9Trkuzm8UjNfnjagEoUV84XYx}\"," >> /usr/share/nginx/html/env.js
echo "  keycloakRealm: \"${KEYCLOAK_REALM:-prodigy}\"," >> /usr/share/nginx/html/env.js
echo "  keycloakUrl: \"${KEYCLOAK_URL:-http://localhost:8080}\"," >> /usr/share/nginx/html/env.js
echo "  baseFrontUrl: \"${BASE_FRONT_URL:-https://localhost:4200}\"," >> /usr/share/nginx/html/env.js
echo "  apiUrl: \"${API_URL:-https://localhost:5001/api}\"," >> /usr/share/nginx/html/env.js
echo "  allowedUrls: \"${ALLOWED_URLS:-localhost}\".split(',')," >> /usr/share/nginx/html/env.js
echo "  production: \"${PRODUCTION:-false}\"," >> /usr/share/nginx/html/env.js

echo "}" >> /usr/share/nginx/html/env.js

exec "$@"
