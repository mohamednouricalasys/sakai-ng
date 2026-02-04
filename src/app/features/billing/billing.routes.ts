import { Routes } from '@angular/router';
import { SubscriptionComponent } from './components/subscription/subscription.component';
import { BillingComponent } from './billing.component';

export const BILLING_ROUTES: Routes = [
    {
        path: '',
        component: BillingComponent, // This component provides the layout with the sidebar
        children: [
            { path: '', redirectTo: 'subscription', pathMatch: 'full' },
            {
                path: 'subscription',
                component: SubscriptionComponent,
            },
        ],
    },
];
