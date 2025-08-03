import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class TranslationService {
    private translations: { [key: string]: any } = {};
    private currentLang = signal<string>('en');
    private isLoaded = signal<boolean>(false);

    readonly currentLanguage = this.currentLang.asReadonly();
    readonly loaded = this.isLoaded.asReadonly();

    constructor() {
        this.initializeTranslations();
    }

    async init(): Promise<void> {
        await this.initializeTranslations();
    }

    private async initializeTranslations() {
        const savedLang = localStorage.getItem('selectedLanguage') || 'en';
        await this.loadTranslations();
        this.currentLang.set(savedLang);
        this.isLoaded.set(true);
    }

    private async loadTranslations() {
        try {
            // Import translations synchronously to ensure they're available
            const [en, es, fr] = await Promise.all([import('../../../locale/messages.en.json'), import('../../../locale/messages.es.json'), import('../../../locale/messages.fr.json')]);

            this.translations = {
                en: en.default,
                es: es.default,
                fr: fr.default,
            };
        } catch (error) {
            console.error('Error loading translations:', error);
            // Fallback translations
            this.translations = {
                en: {},
                fr: {},
                es: {},
            };
        }
    }

    setLanguage(lang: string) {
        if (this.translations[lang]) {
            this.currentLang.set(lang);
            localStorage.setItem('selectedLanguage', lang);
        }
    }

    getCurrentLanguage(): string {
        return this.currentLang();
    }

    translate(key: string): string {
        if (!this.isLoaded()) {
            return key; // Return key while loading
        }

        const lang = this.getCurrentLanguage();
        const translation = this.translations[lang];

        if (!translation) {
            console.warn(`Translation not found for language: ${lang}`);
            return key;
        }

        const result = key.split('.').reduce((obj, k) => obj?.[k], translation);

        if (result === undefined || result === null) {
            console.warn(`Translation key not found: ${key} for language: ${lang}`);
            return key;
        }

        return result;
    }

    isTranslationsLoaded(): boolean {
        return this.isLoaded();
    }
}
