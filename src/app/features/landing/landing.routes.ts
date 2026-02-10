import { Routes } from '@angular/router';
import { LandingFastComponent } from './landing-fast.component';
import { landingGuard } from '../../../guards/landing.guard';

export const LANDING_ROUTES: Routes = [
    {
        path: '',
        canActivate: [landingGuard],
        component: LandingFastComponent,
        title: 'Caviar Scout - Plateforme de Gestion Sportive pour Professionnels',
        data: {
            description: 'Caviar Scout helps recruiters, agents and clubs identify, analyze and compare young talent through structured videos and reliable data.',
            keywords: 'football, soccer, talent scout, recruitment, sports, Africa, Senegal, Cameroon, Ivory Coast',
        },
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
