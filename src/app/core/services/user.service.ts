// user.service.ts
import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { environment } from '../../../environments/environment';
import { User } from '../interfaces/user.interface';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserCreditDetailsDto } from '../interfaces/user-credit-details-dto.interface';

@Injectable({ providedIn: 'root' })
export class UserService {
    private profile?: KeycloakProfile;
    private roles: string[] = [];
    private apiUrl;

    constructor(
        private keycloakService: KeycloakService,
        private http: HttpClient,
    ) {
        this.apiUrl = `${environment.apiUrl}/users`; // Adjust URL as needed
    }

    getUserById(id: string, videoId: string): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${id}/video/${videoId}`);
    }

    getCredisUserById(id: string): Observable<UserCreditDetailsDto> {
        return this.http.get<UserCreditDetailsDto>(`${this.apiUrl}/credis/${id}`);
    }

    removeCurrentUser(): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/me`);
    }

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
