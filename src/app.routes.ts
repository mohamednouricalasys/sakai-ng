import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { authGuard } from './guards/auth.guard';
import { ProdigeCrudComponent } from './app/features/professional/components/prodige-crud/prodige-crud.component';
import { Notfound } from './app/pages/notfound/notfound';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        canActivate: [authGuard], // Apply guard to the layout
        children: [
            { path: '', redirectTo: 'professional/prodiges', pathMatch: 'full' }, // Default route
            {
                path: 'professional',
                // Lazy load the professional routes
                loadChildren: () => import('./app/features/professional/professional.routes').then((m) => m.PROFESSIONAL_ROUTES),
            },
        ],
    },
    { path: 'notfound', component: Notfound },
    { path: '**', redirectTo: '/notfound' },
];
