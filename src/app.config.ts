import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, Router, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeng/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { KeycloakService } from 'keycloak-angular';

import { UserService } from './app/core/services/user.service';
import { TranslationService } from './app/core/services/translation.service';
import { environment } from './environments/environment';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { KeycloakConfig } from 'keycloak-js';

export interface ExtendedKeycloakConfig extends KeycloakConfig {
    clientSecret?: string;
}

function initializeKeycloak(keycloak: KeycloakService, userService: UserService) {
    return async () => {
        try {
            const hasOAuthParams = window.location.hash && (window.location.hash.includes('code=') || window.location.hash.includes('state='));

            const authenticated = await keycloak.init({
                config: {
                    url: environment.keycloakUrl,
                    realm: environment.keycloakRealm,
                    clientId: environment.keycloakclientId,
                },
                initOptions: {
                    onLoad: 'login-required',
                    checkLoginIframe: false,
                    flow: 'standard',
                    redirectUri: window.location.origin + window.location.pathname,
                    pkceMethod: 'S256', // Add PKCE for better security
                },
                shouldAddToken: (request) => {
                    // Don't add token to Keycloak endpoints
                    const url = request.url;
                    return !url.includes(environment.keycloakUrl);
                },
            });

            if (authenticated) {
                await userService.loadUserProfile();

                // Clean URL after successful OAuth callback
                if (hasOAuthParams) {
                    const cleanUrl = window.location.pathname + window.location.search;
                    window.history.replaceState({}, document.title, cleanUrl);
                }

                // Setup token refresh
                keycloak.keycloakEvents$.subscribe({
                    next: (event) => {
                        if (event.type === 1) {
                            // KeycloakEventType.OnTokenExpired
                            keycloak.updateToken(30).catch(() => {
                                console.error('Failed to refresh token, logging out');
                                keycloak.logout(window.location.origin);
                            });
                        }
                    },
                });
            }

            return Promise.resolve();
        } catch (error) {
            console.error('Failed to initialize Keycloak', error);

            // Clean OAuth params on error to prevent loop
            if (window.location.hash.includes('code=')) {
                const cleanUrl = window.location.pathname + window.location.search;
                window.history.replaceState({}, document.title, cleanUrl);
            }

            return Promise.resolve();
        }
    };
}

function initializeTranslations(translationService: TranslationService) {
    return () => translationService.init();
}

export const appConfig: ApplicationConfig = {
    providers: [
        KeycloakService,
        TranslationService,
        {
            provide: APP_INITIALIZER,
            useFactory: initializeKeycloak,
            multi: true,
            deps: [KeycloakService, UserService, Router],
        },
        {
            provide: APP_INITIALIZER,
            useFactory: initializeTranslations,
            multi: true,
            deps: [TranslationService],
        },
        provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
        provideHttpClient(
            withFetch(),
            withInterceptors([authInterceptor]), // Add your interceptor here
        ),
        provideAnimationsAsync(),
        providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } }),
    ],
};
