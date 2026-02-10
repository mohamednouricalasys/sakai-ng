import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import Aura from '@primeng/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { MessageService, ConfirmationService } from 'primeng/api';
import { appRoutes } from './app.routes';
import { KeycloakService } from 'keycloak-angular';
import { TranslationService } from './app/core/services/translation.service';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { provideServiceWorker } from '@angular/service-worker';
import { provideClientHydration } from '@angular/platform-browser';

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
