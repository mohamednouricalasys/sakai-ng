import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { KeycloakService } from 'keycloak-angular';
import { TranslatePipe } from '../../../core/shared';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
    selector: 'hero-widget',
    imports: [ButtonModule, RippleModule, TranslatePipe],
    standalone: true,
    templateUrl: './herowidget.component.html',
    styleUrls: ['./herowidget.component.scss'],
})
export class HeroWidgetComponent {
    private keycloakService = inject(KeycloakService);
    private translationService = inject(TranslationService);

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
