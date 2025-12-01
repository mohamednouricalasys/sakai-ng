import { TranslationService } from './services/translation.service';

export function initializeTranslations(translationService: TranslationService) {
    return () => {
        return new Promise<void>((resolve) => {
            // Wait for translations to load
            const checkLoaded = () => {
                if (translationService.isTranslationsLoaded()) {
                    resolve();
                } else {
                    setTimeout(checkLoaded, 10);
                }
            };
            checkLoaded();
        });
    };
}
