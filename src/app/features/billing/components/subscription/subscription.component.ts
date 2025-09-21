// subscription.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { StripeConfig } from '../../../../core/interfaces/stripe-config.interface';
import { UserSubscription } from '../../../../core/interfaces/UserSubscription';
import { SubscriptionService } from '../../../../core/services/subscription.service';

@Component({
    selector: 'app-subscription',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule, TagModule, MessageModule, ProgressSpinnerModule],
    template: `
        <div class="subscription-container">
            <!-- Current Subscription Status -->
            <p-card header="Subscription Status" *ngIf="subscription">
                <div class="flex justify-content-between align-items-center mb-3">
                    <div>
                        <h3>{{ getStatusDisplay(subscription.status) }}</h3>
                        <p class="text-600 m-0">Credits: {{ subscription.credits === -1 ? 'Unlimited' : subscription.credits }}</p>
                    </div>
                    <p-tag [value]="subscription.status" [severity]="getStatusSeverity(subscription.status)"> </p-tag>
                </div>
                <div class="flex gap-2" *ngIf="subscription.status === 'active'">
                    <p-button label="Manage Subscription" icon="pi pi-cog" (click)="openCustomerPortal()" [loading]="loading"> </p-button>
                    <p-button label="Cancel" icon="pi pi-times" severity="danger" (click)="cancelSubscription()" [loading]="canceling"> </p-button>
                </div>
            </p-card>

            <!-- Pricing Table (when no subscription) -->
            <p-card header="Choose Your Plan" *ngIf="!subscription || subscription.status !== 'active'">
                <div id="pricing-table-container">
                    <p-progressSpinner *ngIf="loading"></p-progressSpinner>
                    <!-- Stripe Pricing Table will be inserted here -->
                </div>
            </p-card>

            <!-- Messages -->
            <p-message *ngIf="message" [severity]="message.type" [text]="message.text"> </p-message>
        </div>
    `,
    styles: [
        `
            .subscription-container {
                max-width: 800px;
                margin: 0 auto;
                padding: 2rem;
            }

            #pricing-table-container {
                min-height: 400px;
                display: flex;
                justify-content: center;
                align-items: center;
            }
        `,
    ],
})
export class SubscriptionComponent implements OnInit {
    config: StripeConfig | null = null;
    subscription: UserSubscription | null = null;
    customerSessionSecret: string | null = null;
    loading = false;
    canceling = false;
    message: { type: 'success' | 'error' | 'info'; text: string } | null = null;

    constructor(private subscriptionService: SubscriptionService) {}

    async ngOnInit() {
        this.loading = true;
        try {
            // Load configuration and user data
            const [config, subscription] = await Promise.all([this.subscriptionService.getConfig().toPromise(), this.subscriptionService.getSubscription().toPromise()]);

            this.config = config!;
            this.subscription = subscription ? subscription : null;

            // Create customer session for Stripe components
            await this.refreshCustomerSession();

            // Load pricing table if no active subscription
            if (!this.subscription || this.subscription.status !== 'active') {
                this.loadPricingTable();
            }
        } catch (error) {
            this.showMessage('error', 'Failed to load subscription data');
            console.error('Error loading subscription:', error);
        } finally {
            this.loading = false;
        }
    }

    private async refreshCustomerSession() {
        try {
            const sessionResponse = await this.subscriptionService.getCustomerSession().toPromise();
            this.customerSessionSecret = sessionResponse!.clientSecret;
        } catch (error) {
            console.error('Error refreshing customer session:', error);
            throw error;
        }
    }

    private loadPricingTable() {
        if (!this.config || !this.customerSessionSecret) return;

        // Create script element for Stripe.js
        const stripeScript = document.createElement('script');
        stripeScript.src = 'https://js.stripe.com/v3/pricing-table.js';
        stripeScript.onload = () => {
            // Create pricing table element
            const pricingTable = document.createElement('stripe-pricing-table');
            pricingTable.setAttribute('pricing-table-id', this.config!.pricingTableId);
            pricingTable.setAttribute('publishable-key', this.config!.publishableKey);
            pricingTable.setAttribute('customer-session-client-secret', this.customerSessionSecret!);

            // Add success URL parameters
            const successUrl = `${window.location.origin}/billing/subscription/success`;
            pricingTable.setAttribute('success-url', successUrl);

            // Insert into container
            const container = document.getElementById('pricing-table-container');
            if (container) {
                container.innerHTML = '';
                container.appendChild(pricingTable);
            }
        };
        document.head.appendChild(stripeScript);
    }

    async openCustomerPortal() {
        if (!this.config) return;

        this.loading = true;

        this.subscriptionService.getCustomerPortalSession().subscribe({
            next: (response) => {
                window.location.href = response.url;
            },
            error: (error) => {},
        });

        this.loading = false;
        return;

        try {
            // Refresh customer session before opening portal
            await this.refreshCustomerSession();

            if (!this.customerSessionSecret) {
                throw new Error('No customer session available');
            }

            // Load Stripe customer portal
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/customer-portal.js';

            script.onload = () => {
                try {
                    // Create customer portal element
                    const customerPortal = document.createElement('stripe-customer-portal');
                    customerPortal.setAttribute('publishable-key', this.config!.publishableKey);
                    customerPortal.setAttribute('customer-session-client-secret', this.customerSessionSecret!);

                    // Add event listeners for better error handling
                    customerPortal.addEventListener('error', (event: any) => {
                        console.error('Customer portal error:', event.detail);
                        this.showMessage('error', 'Failed to open customer portal: ' + event.detail.message);
                        this.loading = false;
                    });

                    customerPortal.addEventListener('close', () => {
                        // Portal was closed
                        this.loading = false;
                        this.refreshSubscription();
                    });

                    // Temporarily add to body and trigger
                    document.body.appendChild(customerPortal);

                    // Clean up after portal closes (fallback)
                    setTimeout(() => {
                        try {
                            if (document.body.contains(customerPortal)) {
                                document.body.removeChild(customerPortal);
                            }
                        } catch (e) {
                            console.warn('Portal cleanup error:', e);
                        }
                        this.loading = false;
                        this.refreshSubscription();
                    }, 10000); // Increased timeout
                } catch (error) {
                    console.error('Error creating customer portal:', error);
                    this.showMessage('error', 'Failed to open customer portal');
                    this.loading = false;
                }
            };

            script.onerror = () => {
                this.showMessage('error', 'Failed to load Stripe customer portal');
                this.loading = false;
            };

            document.head.appendChild(script);
        } catch (error) {
            console.error('Customer portal error:', error);
            this.showMessage('error', 'Failed to open customer portal');
            this.loading = false;
        }
    }

    async cancelSubscription() {
        if (!confirm('Are you sure you want to cancel your subscription?')) return;

        this.canceling = true;
        try {
            const result = await this.subscriptionService.cancelSubscription().toPromise();
            if (result!.success) {
                this.showMessage('success', 'Subscription canceled successfully');
                await this.refreshSubscription();
            } else {
                this.showMessage('error', 'Failed to cancel subscription');
            }
        } catch (error) {
            this.showMessage('error', 'Error canceling subscription');
            console.error('Cancel error:', error);
        } finally {
            this.canceling = false;
        }
    }

    private async refreshSubscription() {
        try {
            const subscription = await this.subscriptionService.getSubscription().toPromise();
            this.subscription = subscription ?? null;
        } catch (error) {
            console.error('Error refreshing subscription:', error);
        }
    }

    getStatusDisplay(status: string): string {
        const statusMap: { [key: string]: string } = {
            active: 'Active Subscription',
            canceled: 'Canceled',
            past_due: 'Past Due',
            incomplete: 'Incomplete',
            trialing: 'Trial Period',
        };
        return statusMap[status] || status;
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' {
        switch (status) {
            case 'active':
                return 'success';
            case 'trialing':
                return 'info';
            case 'past_due':
                return 'warning';
            case 'canceled':
                return 'danger';
            default:
                return 'info';
        }
    }

    private showMessage(type: 'success' | 'error' | 'info', text: string) {
        this.message = { type, text };
        setTimeout(() => {
            this.message = null;
        }, 5000);
    }
}
