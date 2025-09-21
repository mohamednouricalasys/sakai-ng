import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-subscription-success',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule],
    template: `
        <div class="success-container">
            <p-card>
                <div class="text-center">
                    <i class="pi pi-check-circle text-6xl text-green-500 mb-4"></i>
                    <h2 class="mb-2">Subscription Successful!</h2>
                    <p class="text-600 mb-4">Welcome to your new plan. You can start using your credits immediately.</p>
                    <p-button label="Go to Dashboard" icon="pi pi-home" (click)="goToDashboard()"> </p-button>
                </div>
            </p-card>
        </div>
    `,
    styles: [
        `
            .success-container {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 60vh;
                padding: 2rem;
            }
        `,
    ],
})
export class SubscriptionSuccessComponent implements OnInit {
    constructor(private router: Router) {}

    ngOnInit() {
        // Auto-redirect after 5 seconds
        setTimeout(() => {
            this.goToDashboard();
        }, 5000);
    }

    goToDashboard() {
        this.router.navigate(['/dashboard']);
    }
}
