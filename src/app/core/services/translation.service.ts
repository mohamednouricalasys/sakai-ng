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

    // Updated translate method with parameters support
    translate(key: string, params?: Record<string, any>): string {
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

        // Handle parameter interpolation
        if (params && typeof result === 'string') {
            return this.interpolateParams(result, params);
        }

        return result;
    }

    // Helper method to interpolate parameters in translation strings
    private interpolateParams(text: string, params: Record<string, any>): string {
        return Object.keys(params).reduce((result, param) => {
            const regex = new RegExp(`{${param}}`, 'g');
            return result.replace(regex, String(params[param]));
        }, text);
    }

    // Convenience method for translations with count parameter
    translateWithCount(key: string, count: number): string {
        return this.translate(key, { count });
    }

    // Convenience method for translations with multiple common parameters
    translateWithParams(key: string, params: Record<string, any>): string {
        return this.translate(key, params);
    }

    isTranslationsLoaded(): boolean {
        return this.isLoaded();
    }

    // Helper method to get nested translation object (useful for dropdowns, etc.)
    getTranslationObject(key: string): any {
        if (!this.isLoaded()) {
            return {};
        }

        const lang = this.getCurrentLanguage();
        const translation = this.translations[lang];

        if (!translation) {
            return {};
        }

        return key.split('.').reduce((obj, k) => obj?.[k], translation) || {};
    }

    // Method to check if a translation key exists
    hasTranslation(key: string): boolean {
        if (!this.isLoaded()) {
            return false;
        }

        const lang = this.getCurrentLanguage();
        const translation = this.translations[lang];

        if (!translation) {
            return false;
        }

        const result = key.split('.').reduce((obj, k) => obj?.[k], translation);
        return result !== undefined && result !== null;
    }
}
