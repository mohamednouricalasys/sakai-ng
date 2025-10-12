import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { authGuard } from './guards/auth.guard';
import { Notfound } from './app/pages/notfound/notfound';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        canActivate: [authGuard], // Apply guard to the layout
        children: [
            { path: '', redirectTo: 'professional/gellery', pathMatch: 'full' }, // Default route
            {
                path: 'professional',
                // Lazy load the professional routes
                loadChildren: () => import('./app/features/professional/professional.routes').then((m) => m.PROFESSIONAL_ROUTES),
            },
            {
                path: 'billing',
                // Lazy load the professional routes
                loadChildren: () => import('./app/features/billing/billing.routes').then((m) => m.BILLING_ROUTES),
            },
        ],
    },
    { path: 'notfound', component: Notfound },
    { path: '**', redirectTo: '/notfound' },
];
