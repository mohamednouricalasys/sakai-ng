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
                    responseMode: 'query', // Use query params instead of hash
                },
                enableBearerInterceptor: true,
                bearerExcludedUrls: ['/assets'],
            });

            if (authenticated) {
                await userService.loadUserProfile();
            }

            return Promise.resolve();
        } catch (error) {
            console.error('Failed to initialize Keycloak', error);
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
