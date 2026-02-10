import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';
import { KeycloakInitService } from '../app/core/services/keycloak-init.service';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard extends KeycloakAuthGuard {
    private keycloakInit = inject(KeycloakInitService);

    constructor(
        protected override readonly router: Router,
        protected readonly keycloak: KeycloakService,
    ) {
        super(router, keycloak);
    }

    public async isAccessAllowed(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        // Wait for Keycloak to be ready before checking auth
        await this.keycloakInit.whenReady();

        if (!this.authenticated) {
            await this.keycloak.login();
        }

        return this.authenticated;
    }
}
