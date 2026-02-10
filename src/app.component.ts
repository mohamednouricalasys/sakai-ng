import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PrimeNG } from 'primeng/config';
import { TranslationService } from './app/core/services/translation.service';
import { KeycloakInitService } from './app/core/services/keycloak-init.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `<router-outlet></router-outlet>`,
})
export class AppComponent {
    private translationService = inject(TranslationService);
    private keycloakInitService = inject(KeycloakInitService);
    private config = inject(PrimeNG);

    ngOnInit() {
        // Fire-and-forget: Keycloak initializes in the background
        // while the app renders immediately
        this.keycloakInitService.init();

        // Set PrimeNG translations (already loaded via APP_INITIALIZER)
        this.updatePrimeNGTranslations();

        // Listen for language changes
        effect(() => {
            const currentLang = this.translationService.currentLanguage();
            this.updatePrimeNGTranslations();
        });
    }

    private updatePrimeNGTranslations() {
        if (this.translationService.isTranslationsLoaded()) {
            const primeNGTranslations = this.translationService.getTranslationObject('primeng');
            this.config.setTranslation(primeNGTranslations);
        }
    }
}
