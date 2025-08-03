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
    ];

    selectedLanguage = this.translationService.getCurrentLanguage();

    onLanguageChange(event: any) {
        this.translationService.setLanguage(event.value);
        // Optionally reload the page to apply changes immediately
        window.location.reload();
    }
}
