import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { from, switchMap, catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const keycloakService = inject(KeycloakService);

    // URLs that don't need authentication
    const excludedUrls = ['/assets', '/public'];
    const isExcluded = excludedUrls.some((url) => req.url.includes(url));

    if (isExcluded) {
        return next(req);
    }

    // Check if user is authenticated
    if (!keycloakService.isLoggedIn()) {
        return next(req);
    }

    // Refresh token if it's about to expire (within 70 seconds)
    return from(keycloakService.updateToken(70)).pipe(
        switchMap((refreshed) => {
            if (refreshed) {
                console.log('Token was refreshed');
            }

            // Get the current token
            return from(keycloakService.getToken()).pipe(
                switchMap((token) => {
                    // Clone the request and add the authorization header
                    const clonedRequest = req.clone({
                        setHeaders: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    return next(clonedRequest);
                }),
            );
        }),
        catchError((error) => {
            // If token refresh fails, redirect to login
            keycloakService.login();
            return throwError(() => error);
        }),
    );
};
