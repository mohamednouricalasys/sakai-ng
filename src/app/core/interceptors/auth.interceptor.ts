import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
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
                            if (error.status === 401) {
                                keycloakService.login();
                            }
                            return throwError(() => error);
                        }),
                    );
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
