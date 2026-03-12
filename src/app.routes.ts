import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { AuthGuard } from './guards/auth.guard';
import { Notfound } from './app/pages/notfound/notfound';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                redirectTo: 'professional/gallery',
                pathMatch: 'full',
            },
            {
                path: 'professional',
                loadChildren: () => import('./app/features/professional/professional.routes').then((m) => m.PROFESSIONAL_ROUTES),
            },
            {
                path: 'billing',
                loadChildren: () => import('./app/features/billing/billing.routes').then((m) => m.BILLING_ROUTES),
            },
        ],
    },
    {
        path: 'landing',
        loadChildren: () => import('./app/features/landing/landing.routes').then((m) => m.LANDING_ROUTES),
    },
    { path: 'notfound', component: Notfound },
    { path: '**', redirectTo: '/notfound' },
];
