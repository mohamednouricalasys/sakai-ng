// subscription.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KeycloakService } from 'keycloak-angular';
import { environment } from '../../../environments/environment';
import { StripeConfig } from '../interfaces/stripe-config.interface';
import { UserSubscription } from '../interfaces/UserSubscription';

@Injectable({
    providedIn: 'root',
})
export class SubscriptionService {
    private apiUrl;

    constructor(
        private http: HttpClient,
        private keycloakService: KeycloakService,
    ) {
        this.apiUrl = `${environment.apiUrl}/stripes`; // Adjust URL as needed
    }

    getConfig(): Observable<StripeConfig> {
        return this.http.get<StripeConfig>(`${this.apiUrl}/config`);
    }

    createCustomer(email: string, name: string): Observable<{ customerId: string }> {
        return this.http.post<{ customerId: string }>(`${this.apiUrl}/create-customer`, { email, name });
    }

    getCustomerSession(): Observable<{ clientSecret: string }> {
        return this.http.get<{ clientSecret: string }>(`${this.apiUrl}/customer-session`);
    }

    getCustomerPortalSession(): Observable<{ url: string }> {
        return this.http.get<{ url: string }>(`${this.apiUrl}/customer-portal-session`);
    }

    getSubscription(): Observable<UserSubscription | null> {
        return this.http.get<UserSubscription | null>(`${this.apiUrl}/subscription`);
    }

    cancelSubscription(): Observable<{ success: boolean }> {
        return this.http.post<{ success: boolean }>(`${this.apiUrl}/cancel-subscription`, {});
    }
}
