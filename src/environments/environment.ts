// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

// Declare the window.env interface
declare const window: Window & { env?: any };

const env = window.env || {};

export const environment = {
    allowedUrls: env.allowedUrls || ['localhost'],
    keycloakclientId: env.keycloakclientId || 'angular-dev-client',
    // NOTE: Client secret should NOT be in the browser - handle auth server-side
    // If you absolutely need it, it should come from your backend API, not env.js
    keycloakclientsecret: env.keycloakclientsecret || 'GruYchA9Trkuzm8UjNfnjagEoUV84XYx',
    keycloakRealm: env.keycloakRealm || 'prodigy',
    keycloakUrl: env.keycloakUrl || 'http://localhost:8080',
    baseFrontUrl: env.baseFrontUrl || 'https://localhost:4200',
    apiUrl: env.apiUrl || 'https://localhost:5001/api',
    production: env.production || false,
};
