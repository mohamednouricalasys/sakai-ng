import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageService } from '../../../../core/services/message.service';
import { ConfirmationService } from 'primeng/api';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-payment-cancel',
    templateUrl: './payment-cancel.component.html',
    styleUrls: ['./payment-cancel.component.scss'],
    standalone: true,
    imports: [CommonModule, ButtonModule, CardModule],
    providers: [MessageService, ConfirmationService],
})
export class PaymentCancelComponent {
    constructor(private router: Router) {}

    goBack(): void {
        this.router.navigate(['/products']);
    }

    goToSubscription(): void {
        this.router.navigate(['/subscription']);
    }
}
