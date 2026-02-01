// Updated TranslationService with Uppy integration and Browser Language Detection
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
        const detectedLang = this.detectBrowserLanguage();
        const savedLang = localStorage.getItem('selectedLanguage') || detectedLang;
        await this.loadTranslations();
        this.currentLang.set(savedLang);
        this.isLoaded.set(true);
    }

    /**
     * Detect browser language with fallback to English
     * Checks browser navigator languages and maps them to supported languages
     * Falls back to 'en' if no supported language is found
     */
    private detectBrowserLanguage(): string {
        // Get browser languages from navigator
        const browserLanguages = [
            // Primary language (most specific)
            navigator.language,
            // Fallback languages (older browsers)
            ...(navigator.languages || []),
        ].filter((lang) => lang); // Remove undefined/null values

        // Map of supported languages with their variations
        const supportedLanguages = {
            en: ['en', 'en-US', 'en-GB', 'en-US', 'en-UK', 'en_AU', 'en_CA'],
            fr: ['fr', 'fr-FR', 'fr-CA', 'fr-BE', 'fr-CH', 'fr_LU'],
            es: ['es', 'es-ES', 'es-MX', 'es-AR', 'es-CO', 'es-PE', 'es-VE', 'es-CL', 'es-UY', 'es-PY', 'es-BO', 'es-EC', 'es-CR', 'es-PA', 'es-DO', 'es-GT', 'es-HN', 'es-NI', 'es-SV'],
            ar: ['ar', 'ar-SA', 'ar-EG', 'ar-DZ', 'ar-MA', 'ar-TN', 'ar-LB', 'ar-JO', 'ar-SY', 'ar-IQ', 'ar-KW', 'ar-AE', 'ar-BH', 'ar-QA', 'ar-OM', 'ar-YE'],
            de: ['de', 'de-DE', 'de-AT', 'de-CH', 'de-LI', 'de-LU'],
            fi: ['fi', 'fi-FI'],
            it: ['it', 'it-IT', 'it-CH'],
            nl: ['nl', 'nl-NL', 'nl-BE'],
            pt: ['pt', 'pt-PT', 'pt-BR'],
            tr: ['tr', 'tr-TR'],
            zh: ['zh', 'zh-CN', 'zh-TW', 'zh-HK', 'zh-SG'],
        };

        // Check each browser language against supported languages
        for (const browserLang of browserLanguages) {
            for (const [supportedLang, variations] of Object.entries(supportedLanguages)) {
                if (variations.some((variation) => browserLang.toLowerCase().startsWith(variation.toLowerCase()))) {
                    console.log(`Browser language detected: ${browserLang} -> ${supportedLang}`);
                    return supportedLang;
                }
            }
        }

        // If no supported language found, fallback to English
        console.log('No supported browser language detected, falling back to English');
        return 'en';
    }

    private async loadTranslations() {
        try {
            // Import translations synchronously to ensure they're available
            const [en, es, fr, ar, de, fi, it, nl, pt, tr, zh] = await Promise.all([
                import('../../../locale/messages.en.json'),
                import('../../../locale/messages.es.json'),
                import('../../../locale/messages.fr.json'),
                import('../../../locale/messages.ar.json'),
                import('../../../locale/messages.de.json'),
                import('../../../locale/messages.fi.json'),
                import('../../../locale/messages.it.json'),
                import('../../../locale/messages.nl.json'),
                import('../../../locale/messages.pt.json'),
                import('../../../locale/messages.tr.json'),
                import('../../../locale/messages.zh.json'),
            ]);

            this.translations = {
                en: en.default,
                es: es.default,
                fr: fr.default,
                ar: ar.default,
                de: de.default,
                fi: fi.default,
                it: it.default,
                nl: nl.default,
                pt: pt.default,
                tr: tr.default,
                zh: zh.default,
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

    // NEW METHODS FOR UPPY INTEGRATION

    // Get available languages for language switchers
    getAvailableLanguages(): string[] {
        return Object.keys(this.translations);
    }

    // Get language display names
    getLanguageDisplayName(lang: string): string {
        const displayNames: { [key: string]: string } = {
            en: 'English',
            fr: 'Français',
            es: 'Español',
            ar: 'العربية',
            de: 'Deutsch',
            fi: 'Suomi',
            it: 'Italiano',
            nl: 'Nederlands',
            pt: 'Português',
            tr: 'Türkçe',
            zh: '中文',
        };
        return displayNames[lang] || lang;
    }

    // Get all translations for a specific language (useful for debugging)
    getTranslations(lang?: string): any {
        const targetLang = lang || this.getCurrentLanguage();
        return this.translations[targetLang] || this.translations['en'] || {};
    }

    // Get Uppy-specific locale strings for the current language
    getUppyLocale(): any {
        if (!this.isLoaded()) {
            return { strings: {} };
        }

        const lang = this.getCurrentLanguage();
        const translations = this.translations[lang];

        if (!translations || !translations.uploader || !translations.uploader.dashboard || !translations.uploader.dashboard.strings) {
            // Fallback to English
            const enTranslations = this.translations['en'];
            if (enTranslations && enTranslations.uploader && enTranslations.uploader.dashboard && enTranslations.uploader.dashboard.strings) {
                return {
                    strings: enTranslations.uploader.dashboard.strings,
                };
            }
            return { strings: {} };
        }

        return {
            strings: translations.uploader.dashboard.strings,
        };
    }

    // Method to get Uppy locale for a specific language (useful for dynamic switching)
    getUppyLocaleForLanguage(lang: string): any {
        const translations = this.translations[lang];

        if (!translations || !translations.uploader || !translations.uploader.dashboard || !translations.uploader.dashboard.strings) {
            // Fallback to English
            const enTranslations = this.translations['en'];
            if (enTranslations && enTranslations.uploader && enTranslations.uploader.dashboard && enTranslations.uploader.dashboard.strings) {
                return {
                    strings: enTranslations.uploader.dashboard.strings,
                };
            }
            return { strings: {} };
        }

        return {
            strings: translations.uploader.dashboard.strings,
        };
    }

    // Check if uploader translations are available
    hasUploaderTranslations(): boolean {
        const lang = this.getCurrentLanguage();
        const translations = this.translations[lang];
        return !!(translations && translations.uploader);
    }

    // Get uploader translation with fallback
    translateUploader(key: string, params?: Record<string, any>): string {
        const fullKey = `uploader.${key}`;
        return this.translate(fullKey, params);
    }
}

// Custom pipe for template usage (optional - if you prefer pipe syntax)
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'translate',
    standalone: true,
    pure: false, // Make it impure to update when language changes
})
export class TranslatePipe implements PipeTransform {
    constructor(private translationService: TranslationService) {}

    transform(key: string, params?: Record<string, any>): string {
        return this.translationService.translate(key, params);
    }
}
