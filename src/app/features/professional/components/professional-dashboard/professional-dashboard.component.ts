// src/app/features/professional/components/professional-dashboard/professional-dashboard.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Important for ngIf, ngFor etc.

// PrimeNG Modules
import { CardModule } from 'primeng/card';

@Component({
    selector: 'app-professional-dashboard',
    standalone: true, // Make it standalone
    imports: [
        CommonModule, // For Angular directives
        CardModule, // PrimeNG Card
    ],
    templateUrl: './professional-dashboard.component.html',
    styleUrls: ['./professional-dashboard.component.scss'],
})
export class ProfessionalDashboardComponent {
    // ... (logic remains the same)
}
