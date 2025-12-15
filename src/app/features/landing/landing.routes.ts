import { Routes } from '@angular/router';
import { LandingComponent } from './landing.component';
import { landingGuard } from '../../../guards/landing.guard';

export const LANDING_ROUTES: Routes = [
    {
        path: '',
        canActivate: [landingGuard],
        component: LandingComponent,
    },
];
