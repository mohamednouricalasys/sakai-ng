import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentService } from '../../../../core/services/payment.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { MessageService } from '../../../../core/services/message.service';
import { ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-subscription-success',
    templateUrl: './subscription-success.component.html',
    styleUrls: ['./subscription-success.component.scss'],
    standalone: true,
    imports: [CommonModule, ButtonModule, CardModule],
    providers: [MessageService, ConfirmationService],
})
export class SubscriptionSuccessComponent implements OnInit {
    constructor(
        private router: Router,
        private paymentService: PaymentService,
    ) {}

    ngOnInit(): void {
        // Optionnel: Vérifier le statut de l'abonnement
        this.checkSubscriptionStatus();
    }

    async checkSubscriptionStatus(): Promise<void> {
        try {
            const subscription = await this.paymentService.getSubscriptionStatus().toPromise();
            console.log('Subscription status:', subscription);
        } catch (error) {
            console.error('Error checking subscription status:', error);
        }
    }

    goToAccount(): void {
        this.router.navigate(['/subscription']);
    }

    goToProducts(): void {
        this.router.navigate(['/products']);
    }
}
