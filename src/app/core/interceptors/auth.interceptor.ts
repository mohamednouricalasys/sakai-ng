// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { KeycloakService } from 'keycloak-angular';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const keycloakService = inject(KeycloakService);

    // Only add token to API calls (adjust this condition as needed)
    if (req.url.includes('/api/')) {
        return from(keycloakService.getToken()).pipe(
            switchMap((token) => {
                if (token) {
                    const authReq = req.clone({
                        headers: req.headers.set('Authorization', `Bearer ${token}`),
                    });
                    return next(authReq);
                }
                return next(req);
            }),
        );
    }

    return next(req);
};
