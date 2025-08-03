// src/app/features/professional/professional.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // For routerLink

// PrimeNG Modules
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api'; // For MenuItem type
import { UserService } from '../../core/services/user.service';

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
export class ProfessionalComponent implements OnInit {
    constructor(private userService: UserService) {}

    ngOnInit(): void {
        const profile = this.userService.getProfile();
        const roles = this.userService.getRoles();

        console.log('User:', profile);
        console.log('Roles:', roles);
    }
}
