// guards/landing.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakInitService } from '../app/core/services/keycloak-init.service';
import { AuthService } from '../services/auth.service';

export const landingGuard = () => {
    const keycloakInit = inject(KeycloakInitService);
    const authService = inject(AuthService);
    const router = inject(Router);

    // If Keycloak hasn't finished initializing, show the landing page immediately.
    // An unauthenticated user should never have to wait for Keycloak.
    if (!keycloakInit.ready()) {
        return true;
    }

    // Keycloak is ready — check auth status
    if (authService.isAuthenticated()) {
        return router.parseUrl('');
    }

    return true;
};
