// guards/auth-redirect.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const redirectGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const isAuth = authService.isAuthenticated();

    return isAuth ? router.parseUrl('/professional/gellery') : router.parseUrl('/landing');
};
