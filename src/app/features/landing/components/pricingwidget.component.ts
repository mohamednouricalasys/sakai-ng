import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';
import { KeycloakService } from 'keycloak-angular';
import { TranslatePipe } from '../../../core/shared';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
    selector: 'pricing-widget',
    imports: [DividerModule, ButtonModule, RippleModule, TranslatePipe],
    standalone: true,
    templateUrl: './pricingwidget.component.html',
    styleUrls: ['./pricingwidget.component.scss'],
})
export class PricingWidgetComponent {
    private translationService = inject(TranslationService);
    private keycloakService = inject(KeycloakService);

    protected t(key: string, params?: Record<string, any>): string {
        return this.translationService.translate(key, params);
    }

    login() {
        this.keycloakService.login();
    }

    register() {
        this.keycloakService.register();
    }
}
