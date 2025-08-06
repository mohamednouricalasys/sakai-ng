import { Pipe, PipeTransform, inject, ChangeDetectorRef } from '@angular/core';
import { TranslationService } from '../../services/translation.service';

@Pipe({
    name: 'translate',
    pure: false,
    standalone: true,
})
export class TranslatePipe implements PipeTransform {
    private translationService = inject(TranslationService);
    private cdr = inject(ChangeDetectorRef);

    // Support for parameters through pipe arguments
    transform(key: string, params?: Record<string, any>): string {
        if (!this.translationService.isTranslationsLoaded()) {
            // Trigger change detection once translations are loaded
            setTimeout(() => this.cdr.markForCheck(), 0);
            return key;
        }

        return this.translationService.translate(key, params);
    }
}

// Additional pipe for colon-separated parameters (alternative approach)
@Pipe({
    name: 'translateParams',
    pure: false,
    standalone: true,
})
export class TranslateParamsPipe implements PipeTransform {
    private translationService = inject(TranslationService);
    private cdr = inject(ChangeDetectorRef);

    // Usage: {{ 'key:param1:value1:param2:value2' | translateParams }}
    transform(keyWithParams: string): string {
        if (!this.translationService.isTranslationsLoaded()) {
            setTimeout(() => this.cdr.markForCheck(), 0);
            return keyWithParams;
        }

        if (!keyWithParams || !keyWithParams.includes(':')) {
            return this.translationService.translate(keyWithParams);
        }

        const parts = keyWithParams.split(':');
        const key = parts[0];

        const params: Record<string, any> = {};
        for (let i = 1; i < parts.length; i += 2) {
            if (parts[i + 1] !== undefined) {
                const value = parts[i + 1];
                // Try to convert to number if it's a numeric string
                params[parts[i]] = !isNaN(Number(value)) && value.trim() !== '' ? Number(value) : value;
            }
        }

        return this.translationService.translate(key, Object.keys(params).length > 0 ? params : undefined);
    }
}

// Pipe for count-specific translations (most common use case)
@Pipe({
    name: 'translateCount',
    pure: false,
    standalone: true,
})
export class TranslateCountPipe implements PipeTransform {
    private translationService = inject(TranslationService);
    private cdr = inject(ChangeDetectorRef);

    // Usage: {{ 'key' | translateCount:5 }}
    transform(key: string, count: number): string {
        if (!this.translationService.isTranslationsLoaded()) {
            setTimeout(() => this.cdr.markForCheck(), 0);
            return key;
        }

        return this.translationService.translateWithCount(key, count);
    }
}
