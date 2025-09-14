// services/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StripeConfig } from '../interfaces/stripe-config.interface';
import { StripeProduct } from '../interfaces/StripeProduct';
import { CreateCustomerRequest } from '../interfaces/create-customer-request.interface';
import { CreateSessionRequest } from '../interfaces/create-session-request.interface';
import { SessionResponse } from '../interfaces/session-response.interface';
import { CreatePaymentSessionRequest } from '../interfaces/create-payment-session-request.interface';
import { UserSubscription } from '../interfaces/UserSubscription';

@Injectable({
    providedIn: 'root',
})
export class PaymentService {
    private readonly apiUrl = `${environment.apiUrl}/stripes`;

    constructor(private http: HttpClient) {}

    getStripeConfig(): Observable<StripeConfig> {
        return this.http.get<StripeConfig>(`${this.apiUrl}/config`);
    }

    getProducts(): Observable<StripeProduct[]> {
        return this.http.get<StripeProduct[]>(`${this.apiUrl}/products`);
    }

    createCustomer(request: CreateCustomerRequest): Observable<{ customerId: string }> {
        return this.http.post<{ customerId: string }>(`${this.apiUrl}/create-customer`, request);
    }

    createSubscriptionSession(request: CreateSessionRequest): Observable<SessionResponse> {
        return this.http.post<SessionResponse>(`${this.apiUrl}/create-subscription-session`, request);
    }

    createPaymentSession(request: CreatePaymentSessionRequest): Observable<SessionResponse> {
        return this.http.post<SessionResponse>(`${this.apiUrl}/create-payment-session`, request);
    }

    cancelSubscription(): Observable<{ success: boolean }> {
        return this.http.post<{ success: boolean }>(`${this.apiUrl}/cancel-subscription`, {});
    }

    getSubscriptionStatus(): Observable<UserSubscription> {
        return this.http.get<UserSubscription>(`${this.apiUrl}/subscription-status`);
    }
}
