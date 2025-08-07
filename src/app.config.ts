import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeng/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { KeycloakService } from 'keycloak-angular';

import { UserService } from './app/core/services/user.service';
import { TranslationService } from './app/core/services/translation.service';
import { environment } from './environments/environment';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';

function initializeKeycloak(keycloak: KeycloakService, userService: UserService) {
    return async () => {
        await keycloak.init({
            config: {
                url: environment.keycloakUrl,
                realm: environment.keycloakRealm,
                clientId: environment.keycloakclientId,
            },
            initOptions: {
                checkLoginIframe: false,
                flow: 'standard',
            },
            shouldAddToken: () => false,
        });

        if (keycloak.isLoggedIn()) {
            await userService.loadUserProfile();
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
            deps: [KeycloakService, UserService],
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
