// components/products/products.component.ts
import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { StripeProduct } from '../../../../core/interfaces/StripeProduct';
import { PaymentService } from '../../../../core/services/payment.service';
import { StripeService } from '../../../../core/services/stripe.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-products',
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.scss'],
    standalone: true,
    imports: [CommonModule, ButtonModule, CardModule, ProgressSpinnerModule, MessageModule],
    providers: [MessageService, ConfirmationService],
})
export class ProductsComponent implements OnInit {
    products: StripeProduct[] = [];
    isLoading = false;
    processingProductId: string | null = null;

    constructor(
        private paymentService: PaymentService,
        private stripeService: StripeService,
        private messageService: MessageService,
    ) {}

    ngOnInit(): void {
        this.loadProducts();
    }

    async loadProducts(): Promise<void> {
        try {
            this.isLoading = true;
            this.products = (await this.paymentService.getProducts().toPromise()) || [];
        } catch (error) {
            console.error('Error loading products:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors du chargement des produits',
            });
        } finally {
            this.isLoading = false;
        }
    }

    async purchaseProduct(product: StripeProduct): Promise<void> {
        try {
            this.processingProductId = product.priceId;

            const successUrl = `${window.location.origin}/payment/success?product=${encodeURIComponent(product.name)}`;
            const cancelUrl = `${window.location.origin}/payment/cancel`;

            const response = await this.paymentService
                .createPaymentSession({
                    priceId: product.priceId,
                    successUrl,
                    cancelUrl,
                })
                .toPromise();

            if (response?.sessionId) {
                await this.stripeService.redirectToCheckout(response.sessionId);
            }
        } catch (error) {
            console.error('Error creating payment session:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors de la création du paiement',
            });
        } finally {
            this.processingProductId = null;
        }
    }

    isProcessing(priceId: string): boolean {
        return this.processingProductId === priceId;
    }

    formatPrice(amount: number, currency: string): string {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(amount);
    }
}
