import { Component, inject } from '@angular/core';
import { StyleClassModule } from 'primeng/styleclass';
import { Router, RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { AppFloatingConfigurator } from '../../../layout/component/app.floatingconfigurator';
import { KeycloakService } from 'keycloak-angular';
import { TranslatePipe, TranslationService } from '../../../core/services/translation.service';
import { LanguageSwitcherComponent } from '../../../core/shared';

@Component({
    selector: 'topbar-widget',
    imports: [RouterModule, StyleClassModule, ButtonModule, RippleModule, AppFloatingConfigurator, TranslatePipe, LanguageSwitcherComponent],
    templateUrl: './topbarwidget.component.html',
    styleUrls: ['./topbarwidget.component.scss'],
})
export class TopbarWidget {
    private keycloakService = inject(KeycloakService);
    private translationService = inject(TranslationService);

    constructor(public router: Router) {}

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
