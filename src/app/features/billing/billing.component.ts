// src/app/features/billing/billing.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // For routerLink

// PrimeNG Modules
import { MenuModule } from 'primeng/menu';

@Component({
    selector: 'app-billing',
    standalone: true, // Make it standalone
    imports: [
        CommonModule,
        RouterModule, // Needed for router-outlet and routerLink
        MenuModule, // PrimeNG Menu
    ],
    templateUrl: './billing.component.html',
    styleUrls: ['./billing.component.scss'],
})
export class BillingComponent {}
