// user.service.ts
import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';

@Injectable({ providedIn: 'root' })
export class UserService {
    private profile?: KeycloakProfile;
    private roles: string[] = [];

    constructor(private keycloakService: KeycloakService) {}

    async loadUserProfile(): Promise<void> {
        this.profile = await this.keycloakService.loadUserProfile();
        this.roles = this.keycloakService.getUserRoles(); // realm roles
    }

    getProfile(): KeycloakProfile | undefined {
        return this.profile;
    }

    getRoles(): string[] {
        return this.roles;
    }

    isInRole(role: string): boolean {
        return this.roles.includes(role);
    }

    getUsername(): string | undefined {
        return this.profile?.username;
    }
}
