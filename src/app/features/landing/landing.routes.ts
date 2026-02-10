import { Routes } from '@angular/router';
import { LandingComponent } from './landing.component';
import { landingGuard } from '../../../guards/landing.guard';

export const LANDING_ROUTES: Routes = [
    {
        path: '',
        canActivate: [landingGuard],
        component: LandingComponent,
        title: 'Caviar Scout - Plateforme de Gestion Sportive pour Professionnels',
    },
    {
        path: 'privacy',
        loadComponent: () => import('./components/privacy-policy/privacy-policy.component').then((m) => m.PrivacyPolicyComponent),
        title: 'Privacy Policy - Caviar Scout',
    },
    {
        path: 'terms',
        loadComponent: () => import('./components/terms-of-service/terms-of-service.component').then((m) => m.TermsOfServiceComponent),
        title: 'Terms of Service - Caviar Scout',
    },
];
