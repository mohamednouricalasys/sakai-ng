import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
    selector: 'footer-widget',
    imports: [RouterModule],
    standalone: true,
    templateUrl: './footerwidget.component.html',
    styleUrls: ['./footerwidget.component.scss'],
})
export class FooterWidgetComponent {
    constructor(public router: Router) {}

    private translationService = inject(TranslationService);

    protected t(key: string, params?: Record<string, any>): string {
        return this.translationService.translate(key, params);
    }
}
