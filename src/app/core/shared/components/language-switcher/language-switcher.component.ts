import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
    selector: 'app-language-switcher',
    standalone: true,
    imports: [FormsModule, DropdownModule],
    template: ` <p-dropdown [options]="languages" [(ngModel)]="selectedLanguage" (onChange)="onLanguageChange($event)" optionLabel="label" optionValue="value" [style]="{ 'min-width': '120px' }"> </p-dropdown> `,
})
export class LanguageSwitcherComponent {
    private translationService = inject(TranslationService);

    languages = [
        { label: 'English', value: 'en' },
        { label: 'Français', value: 'fr' },
        { label: 'Español', value: 'es' },
        { label: 'العربية', value: 'ar' },
        { label: 'Deutsch', value: 'de' },
        { label: 'Suomi', value: 'fi' },
        { label: 'Italiano', value: 'it' },
        { label: 'Nederlands', value: 'nl' },
        { label: 'Português', value: 'pt' },
        { label: 'Türkçe', value: 'tr' },
        { label: '中文', value: 'zh' },
    ];

    selectedLanguage = this.translationService.getCurrentLanguage();

    onLanguageChange(event: any) {
        this.translationService.setLanguage(event.value);
        // Optionally reload the page to apply changes immediately
        window.location.reload();
    }
}
