// components/subscription/subscription.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { UserSubscription } from '../../../../core/interfaces/UserSubscription';
import { PaymentService } from '../../../../core/services/payment.service';
import { StripeService } from '../../../../core/services/stripe.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';

@Component({
    selector: 'app-subscription',
    templateUrl: './subscription.component.html',
    styleUrls: ['./subscription.component.scss'],
    standalone: true,
    imports: [CommonModule, ButtonModule, CardModule, ProgressSpinnerModule, TagModule],
    providers: [MessageService, ConfirmationService],
})
export class SubscriptionComponent implements OnInit {
    subscription: UserSubscription | null = null;
    isLoading = false;
    hasActiveSubscription = false;

    constructor(
        private paymentService: PaymentService,
        private stripeService: StripeService,
        private messageService: MessageService,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.loadSubscriptionStatus();
    }

    async loadSubscriptionStatus(): Promise<void> {
        try {
            this.isLoading = true;
            const result = await this.paymentService.getSubscriptionStatus().toPromise();
            this.subscription = result !== undefined ? result : null;
            this.hasActiveSubscription = this.subscription?.status === 'active';
        } catch (error) {
            console.error('Error loading subscription:', error);
        } finally {
            this.isLoading = false;
        }
    }

    async startSubscription(): Promise<void> {
        try {
            this.isLoading = true;

            const successUrl = `${window.location.origin}/subscription/success`;
            const cancelUrl = `${window.location.origin}/subscription/cancel`;

            const response = await this.paymentService
                .createSubscriptionSession({
                    successUrl,
                    cancelUrl,
                })
                .toPromise();

            if (response?.sessionId) {
                await this.stripeService.redirectToCheckout(response.sessionId);
            }
        } catch (error) {
            console.error('Error creating subscription:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: "Erreur lors de la création de l'abonnement",
            });
        } finally {
            this.isLoading = false;
        }
    }

    async cancelSubscription(): Promise<void> {
        try {
            this.isLoading = true;

            const response = await this.paymentService.cancelSubscription().toPromise();

            if (response?.success) {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Abonnement annulé avec succès',
                });
                await this.loadSubscriptionStatus();
            }
        } catch (error) {
            console.error('Error canceling subscription:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: "Erreur lors de l'annulation de l'abonnement",
            });
        } finally {
            this.isLoading = false;
        }
    }
}
