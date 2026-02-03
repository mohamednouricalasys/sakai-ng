// Environment configuration for Caviar Scout
// This file is loaded by index.html to set up environment variables

window.env = {
    // Add your environment variables here
    NODE_ENV: 'development',
    API_URL: 'https://api.caviascout.com',
    KEYCLOAK_URL: 'https://auth.caviascout.com',
    KEYCLOAK_REALM: 'prodigy',
    KEYCLOAK_CLIENT_ID: 'app-client',
};

// Development helper
console.log('Environment variables loaded:', window.env);
