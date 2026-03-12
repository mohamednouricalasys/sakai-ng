import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import Aura from '@primeng/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { MessageService, ConfirmationService } from 'primeng/api';
import { appRoutes } from './app.routes';
import { KeycloakService, KeycloakEventTypeLegacy } from 'keycloak-angular';
import { UserService } from './app/core/services/user.service';
import { TranslationService } from './app/core/services/translation.service';
import { environment } from './environments/environment';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { Capacitor } from '@capacitor/core';
import { provideServiceWorker } from '@angular/service-worker';
import { provideClientHydration } from '@angular/platform-browser';

function initializeKeycloak(keycloak: KeycloakService, userService: UserService) {
    return async () => {
        const isNative = Capacitor.isNativePlatform();
        try {
            const authenticated = await keycloak.init({
                config: {
                    url: environment.keycloakUrl,
                    realm: environment.keycloakRealm,
                    clientId: environment.keycloakclientId,
                },
                initOptions: {
                    onLoad: isNative ? undefined : 'check-sso',
                    silentCheckSsoRedirectUri: isNative ? undefined : window.location.origin + '/assets/silent-check-sso.html',
                    checkLoginIframe: !isNative,
                    checkLoginIframeInterval: 30,
                },
                // This determines when to add the token to requests
                shouldAddToken: (request) => {
                    const { url } = request;
                    // Add token to all requests except these
                    const excludedUrls = ['/assets', '/public'];
                    return !excludedUrls.some((excluded) => url.includes(excluded));
                },
                // Update token minimum validity
                shouldUpdateToken: (request) => {
                    // Refresh token if it expires in less than 70 seconds
                    return true;
                },
            });

            if (authenticated) {
                try {
                    await userService.loadUserProfile();
                } catch (error) {
                    console.warn('Failed to load user profile, continuing anyway', error);
                }

                // Set up automatic token refresh every 30 seconds
                setInterval(async () => {
                    try {
                        await keycloak.updateToken(60);
                    } catch (error) {
                        // Token refresh failed - don't force login, let guards handle it
                        console.warn('Token refresh failed', error);
                    }
                }, 30000);
            }

            // Listen for Keycloak events - only handle logout, not token expiry
            // Token expiry is handled by the refresh interval and guards
            keycloak.keycloakEvents$.subscribe({
                next: (event) => {
                    if (event.type === KeycloakEventTypeLegacy.OnAuthLogout) {
                        // User explicitly logged out, redirect to landing
                        window.location.href = '/landing';
                    }
                    // Don't auto-login on OnTokenExpired - let guards handle navigation
                },
            });
        } catch (error) {
            console.error('Keycloak initialization failed', error);
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
        MessageService,
        ConfirmationService,
        {
            provide: APP_INITIALIZER,
            useFactory: initializeKeycloak,
            multi: true,
            deps: [KeycloakService, UserService],
        },
        {
            provide: APP_INITIALIZER,
            useFactory: initializeTranslations,
            multi: true,
            deps: [TranslationService],
        },
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(appRoutes),
        provideClientHydration(),
        provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
        provideAnimationsAsync(),
        providePrimeNG({
            theme: {
                preset: Aura,
                options: { darkModeSelector: '.app-dark' },
            },
        }),
        provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000',
        }),
    ],
};
