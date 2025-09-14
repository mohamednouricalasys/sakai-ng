// services/stripe.service.ts
import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { PaymentService } from './payment.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class StripeService {
    private stripe: Stripe | null = null;

    constructor(private paymentService: PaymentService) {}

    async initializeStripe(): Promise<void> {
        if (this.stripe) return;

        const config = await firstValueFrom(this.paymentService.getStripeConfig());
        this.stripe = await loadStripe(config.publishableKey);
    }

    async redirectToCheckout(sessionId: string): Promise<void> {
        if (!this.stripe) {
            await this.initializeStripe();
        }

        const { error } = await this.stripe!.redirectToCheckout({ sessionId });

        if (error) {
            console.error('Stripe redirect error:', error);
            throw error;
        }
    }
}
