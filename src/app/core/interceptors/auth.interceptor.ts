import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { from, switchMap, catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const keycloakService = inject(KeycloakService);
    const router = inject(Router);

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

    // Refresh token if it's about to expire (within 60 seconds)
    return from(keycloakService.updateToken(60)).pipe(
        switchMap(() => {
            // Get the current token
            return from(keycloakService.getToken()).pipe(
                switchMap((token) => {
                    // Clone the request and add the authorization header
                    const clonedRequest = req.clone({
                        setHeaders: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    return next(clonedRequest).pipe(
                        catchError((error: HttpErrorResponse) => {
                            // Handle 401 Unauthorized - session expired on backend
                            // Redirect to landing instead of forcing login to avoid loops
                            if (error.status === 401) {
                                keycloakService.logout(window.location.origin + '/landing');
                            }
                            return throwError(() => error);
                        }),
                    );
                }),
            );
        }),
        catchError((error) => {
            // If token refresh fails, logout and redirect to landing
            // This prevents infinite login loops
            console.warn('Token refresh failed, redirecting to landing', error);
            keycloakService.logout(window.location.origin + '/landing');
            return throwError(() => error);
        }),
    );
};
