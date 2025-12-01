import { Injectable, inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private keycloak = inject(KeycloakService);

  login() {
    return this.keycloak.login();
  }

  logout() {
    return this.keycloak.logout();
  }

  register() {
    return this.keycloak.register();
  }

  isAuthenticated(): boolean {
    return this.keycloak.isLoggedIn();
  }

  getUserProfile() {
    return this.keycloak.loadUserProfile();
  }
}