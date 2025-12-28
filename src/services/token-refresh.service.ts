import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

// token-refresh.service.ts
@Injectable({ providedIn: 'root' })
export class TokenRefreshService {
    constructor(private keycloak: KeycloakService) {}

    startRefreshTimer() {
        setInterval(() => {
            this.keycloak
                .updateToken(70)
                .then((refreshed) => {})
                .catch(() => this.keycloak.login());
        }, 60000);
    }
}
