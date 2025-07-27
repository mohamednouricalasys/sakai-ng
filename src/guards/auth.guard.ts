import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

export const authGuard: CanActivateFn = async (route, state) => {
  const keycloakService = inject(KeycloakService);
  const router = inject(Router);

  try {
    // Wait for Keycloak to be ready
    const isReady = keycloakService.getKeycloakInstance()?.authenticated !== undefined;
    
    if (!isReady) {
      // Keycloak is still initializing, allow navigation to continue
      // and let the app initialization handle the auth flow
      return true;
    }

    const isLoggedIn = await keycloakService.isLoggedIn();

    if (!isLoggedIn) {
      // Only redirect to login if we're not already in the middle of a login flow
      const currentUrl = window.location.href;
      const hasAuthParams = currentUrl.includes('code=') || currentUrl.includes('state=');
      
      if (hasAuthParams) {
        // We're in the middle of OAuth callback, let it complete
        return true;
      }

      await keycloakService.login({
        redirectUri: window.location.origin + state.url,
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Auth guard error:', error);
    // On error, redirect to a safe route or allow access based on your needs
    router.navigate(['/error']);
    return false;
  }
};