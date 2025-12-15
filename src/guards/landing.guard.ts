// guards/landing.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const landingGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const isAuth = authService.isAuthenticated();

    // If authenticated, redirect to professional area
    if (isAuth) {
        return router.parseUrl('');
    }

    // Otherwise allow access to landing page
    return true;
};
