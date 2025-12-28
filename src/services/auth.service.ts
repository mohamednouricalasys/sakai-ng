import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private keycloak = inject(KeycloakService);
    private router = inject(Router);

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

    goToDashboard() {
        this.router.navigate(['/professional']);
    }

    isModerator(): boolean {
        return this.keycloak.isUserInRole('moderator');
    }

    hasRole(role: string): boolean {
        return this.keycloak.isUserInRole(role);
    }

    getUserRoles(): string[] {
        return this.keycloak.getUserRoles();
    }
}
