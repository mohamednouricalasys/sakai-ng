import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PrimeNG } from 'primeng/config';
import { TranslationService } from './app/core/services/translation.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `<router-outlet></router-outlet>`,
})
export class AppComponent {
    private translationService = inject(TranslationService);
    private config = inject(PrimeNG);

    async ngOnInit() {
        const savedLang = this.translationService.getCurrentLanguage();
        this.translationService.setLanguage(savedLang);

        // Ensure translations are loaded
        await this.ensureTranslationsLoaded();

        // Set initial PrimeNG translations
        this.updatePrimeNGTranslations();

        // Listen for language changes
        effect(() => {
            const currentLang = this.translationService.currentLanguage();
            this.updatePrimeNGTranslations();
        });
    }

    private async ensureTranslationsLoaded(): Promise<void> {
        if (!this.translationService.isTranslationsLoaded()) {
            await this.translationService.init();
        }
    }

    private updatePrimeNGTranslations() {
        if (this.translationService.isTranslationsLoaded()) {
            const primeNGTranslations = this.translationService.getTranslationObject('primeng');
            this.config.setTranslation(primeNGTranslations);
        }
    }
}
