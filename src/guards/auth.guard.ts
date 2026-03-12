import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
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

    public async isAccessAllowed(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
        if (!this.authenticated) {
            // Redirect to landing page instead of forcing login
            // This prevents infinite loop when token is invalid/expired
            return this.router.parseUrl('/landing');
        }

        return true;
    }
}
