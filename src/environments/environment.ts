// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
const env = window.env || {};
export const environment = {
    allowedUrls: env.allowedUrls || ['localhost'],
    keycloakclientId: env.keycloakclientId || 'angular-dev-client',
    keycloakclientsecret: env.keycloakclientsecret || 'GruYchA9Trkuzm8UjNfnjagEoUV84XYx',
    keycloakRealm: env.keycloakRealm || 'prodigy',
    keycloakUrl: env.keycloakUrl || 'http://localhost:8080',
    baseFrontUrl: env.baseFrontUrl || 'https://localhost:4200',
    apiUrl: env.apiUrl || 'https://localhost:5001/api',
    production: env.production || false,
};
