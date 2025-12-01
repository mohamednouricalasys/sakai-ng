import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard extends KeycloakAuthGuard {
    constructor(
        protected override readonly router: Router,
        protected readonly keycloak: KeycloakService,
    ) {
        super(router, keycloak);
    }

    public async isAccessAllowed(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        if (!this.authenticated) {
            // Remove hash fragment and query params from redirect URI
            const cleanUrl = state.url.split('#')[0].split('?')[0];

            await this.keycloak.login({
                redirectUri: window.location.origin + cleanUrl,
            });
            return false;
        }

        return this.authenticated;
    }
}
