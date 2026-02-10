// guards/auth-redirect.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakInitService } from '../app/core/services/keycloak-init.service';
import { AuthService } from '../services/auth.service';

export const redirectGuard = async () => {
    const keycloakInit = inject(KeycloakInitService);
    const authService = inject(AuthService);
    const router = inject(Router);

    // Wait for Keycloak to be ready before deciding where to redirect
    await keycloakInit.whenReady();

    const isAuth = authService.isAuthenticated();
    return isAuth ? router.parseUrl('/professional/gallery') : router.parseUrl('/landing');
};
