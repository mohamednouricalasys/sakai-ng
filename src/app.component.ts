import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslationService } from './app/core/services/translation.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `<router-outlet></router-outlet>`,
})
export class AppComponent {
    private translationService = inject(TranslationService);

    ngOnInit() {
        const savedLang = this.translationService.getCurrentLanguage();
        this.translationService.setLanguage(savedLang);
    }
}
