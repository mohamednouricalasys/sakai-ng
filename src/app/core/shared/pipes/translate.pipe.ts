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

    transform(key: string): string {
        if (!this.translationService.isTranslationsLoaded()) {
            // Trigger change detection once translations are loaded
            setTimeout(() => this.cdr.markForCheck(), 0);
            return key;
        }

        return this.translationService.translate(key);
    }
}
