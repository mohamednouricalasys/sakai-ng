// subscription.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';
import { SubscriptionService } from '../../../../core/services/subscription.service';
import { UserService } from '../../../../core/services/user.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { TranslateParamsPipe, TranslatePipe } from '../../../../core/shared';

interface SubscriptionStatus {
    isActive: boolean;
    plan: string;
    credits: number;
    status: string;
}

@Component({
    selector: 'app-subscription',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule, TagModule, MessageModule, ProgressSpinnerModule, DividerModule, TranslatePipe, TranslateParamsPipe],
    templateUrl: './subscription.component.html',
    styleUrl: './subscription.component.scss',
})
export class SubscriptionComponent implements OnInit {
    subscriptionStatus: SubscriptionStatus | null = null;
    loading = true;
    loadingPricing = false;
    actionLoading = false;
    message: { type: 'success' | 'error' | 'info'; text: string } | null = null;

    private config: any = null;
    private customerSessionSecret: string | null = null;
    private translationService = inject(TranslationService);

    constructor(
        private subscriptionService: SubscriptionService,
        private userService: UserService,
    ) {}

    async ngOnInit() {
        await this.loadSubscriptionData();
    }

    protected t(key: string, params?: Record<string, any>): string {
        return this.translationService.translate(key, params);
    }

    private async loadSubscriptionData() {
        try {
            this.loading = true;

            const [config, subscription] = await Promise.all([this.subscriptionService.getConfig().toPromise(), this.subscriptionService.getSubscription().toPromise()]);

            this.config = config;

            if (subscription && subscription.status === 'active') {
                this.subscriptionStatus = {
                    isActive: true,
                    plan: subscription.plan,
                    credits: subscription.credits,
                    status: subscription.status,
                };
            } else {
                this.subscriptionStatus = { isActive: false, plan: '', credits: 0, status: '' };
                await this.setupPricingTable();
            }
        } catch (error) {
            this.showMessage('error', this.t('subscription.messages.loadError'));
            console.error('Subscription loading error:', error);
        } finally {
            this.loading = false;
        }
    }

    private async setupPricingTable() {
        try {
            this.loadingPricing = true;

            // Create customer session
            const profile = this.userService.getProfile();
            const customer = await this.subscriptionService.createCustomer(profile?.email!, profile?.username!).toPromise();

            const sessionResponse = await this.subscriptionService.getCustomerSession(this.config.pricingTableId, window.location.href).toPromise();

            this.customerSessionSecret = sessionResponse!.clientSecret;

            // Load Stripe pricing table
            this.loadStripePricingTable();
        } catch (error) {
            this.showMessage('error', this.t('subscription.messages.pricingError'));
            console.error('Pricing table setup error:', error);
        } finally {
            this.loadingPricing = false;
        }
    }

    private loadStripePricingTable() {
        const stripeScript = document.createElement('script');
        stripeScript.src = 'https://js.stripe.com/v3/pricing-table.js';
        stripeScript.onload = () => {
            const pricingTable = document.createElement('stripe-pricing-table');
            pricingTable.setAttribute('pricing-table-id', this.config.pricingTableId);
            pricingTable.setAttribute('publishable-key', this.config.publishableKey);
            pricingTable.setAttribute('customer-session-client-secret', this.customerSessionSecret!);

            const container = document.getElementById('pricing-table-container');
            if (container) {
                container.innerHTML = '';
                container.appendChild(pricingTable);
            }
        };
        document.head.appendChild(stripeScript);
    }

    async openCustomerPortal() {
        this.actionLoading = true;

        try {
            const response = await this.subscriptionService.getCustomerPortalSession(window.location.href).toPromise();

            if (response?.url) {
                window.location.href = response.url;
            }
        } catch (error) {
            this.showMessage('error', this.t('subscription.messages.portalError'));
            console.error('Customer portal error:', error);
        } finally {
            this.actionLoading = false;
        }
    }

    async cancelSubscription() {
        if (!confirm(this.t('subscription.confirmations.cancel'))) {
            return;
        }

        this.actionLoading = true;

        try {
            const result = await this.subscriptionService.cancelSubscription().toPromise();

            if (result?.success) {
                this.showMessage('success', this.t('subscription.messages.cancelSuccess'));
                await this.loadSubscriptionData(); // Refresh the view
            } else {
                this.showMessage('error', this.t('subscription.messages.cancelError'));
            }
        } catch (error) {
            this.showMessage('error', this.t('subscription.messages.cancelErrorGeneric'));
            console.error('Cancellation error:', error);
        } finally {
            this.actionLoading = false;
        }
    }

    getPlanDisplayName(planId: string): string {
        const planKey = `subscription.plans.${planId}`;
        const translation = this.t(planKey);

        // If translation doesn't exist, fall back to default
        return translation !== planKey ? translation : this.t('subscription.plans.default');
    }

    private showMessage(type: 'success' | 'error' | 'info', text: string) {
        this.message = { type, text };
        setTimeout(() => (this.message = null), 5000);
    }
}
