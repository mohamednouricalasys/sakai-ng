// src/app/features/professional/professional.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // For routerLink

// PrimeNG Modules
import { MenuModule } from 'primeng/menu';

@Component({
    selector: 'app-professional',
    standalone: true, // Make it standalone
    imports: [
        CommonModule,
        RouterModule, // Needed for router-outlet and routerLink
        MenuModule, // PrimeNG Menu
    ],
    templateUrl: './professional.component.html',
    styleUrls: ['./professional.component.scss'],
})
export class ProfessionalComponent {}
