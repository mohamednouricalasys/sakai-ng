// Environment configuration for Caviar Scout
// This file is loaded by index.html to set up environment variables

window.env = {
    // Add your environment variables here
    NODE_ENV: 'development',
    API_URL: 'http://localhost:5000',
    KEYCLOAK_URL: 'http://localhost:8080',
    KEYCLOAK_REALM: 'caviarscout',
    KEYCLOAK_CLIENT_ID: 'caviarscout-web',
};

// Development helper
console.log('Environment variables loaded:', window.env);
