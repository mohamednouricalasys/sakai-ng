import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageService } from '../../../../core/services/message.service';
import { ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-payment-success',
    templateUrl: './payment-success.component.html',
    styleUrls: ['./payment-success.component.scss'],
    standalone: true,
    imports: [CommonModule, ButtonModule, CardModule],
    providers: [MessageService, ConfirmationService],
})
export class PaymentSuccessComponent implements OnInit {
    productName: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.productName = this.route.snapshot.queryParams['product'];
    }

    goToProducts(): void {
        this.router.navigate(['/products']);
    }

    goToSubscriptions(): void {
        this.router.navigate(['/subscription']);
    }
}
