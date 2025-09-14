import { Routes } from '@angular/router';
import { SubscriptionComponent } from './components/subscription/subscription.component';
import { SubscriptionSuccessComponent } from './components/subscription-success/subscription-success.component';
import { BillingComponent } from './billing.component';
import { PaymentCancelComponent } from './components/payment-cancel/payment-cancel.component';
import { ProductsComponent } from './components/products/products.component';
import { PaymentSuccessComponent } from './components/payment-success/payment-success.component';

export const BILLING_ROUTES: Routes = [
    {
        path: '',
        component: BillingComponent, // This component provides the layout with the sidebar
        children: [
            {
                path: 'subscription',
                component: SubscriptionComponent,
            },
            {
                path: 'subscription/success',
                component: SubscriptionSuccessComponent,
            },
            {
                path: 'subscription/cancel',
                component: PaymentCancelComponent,
            },
            {
                path: 'products',
                component: ProductsComponent,
            },
            {
                path: 'payment/success',
                component: PaymentSuccessComponent,
            },
            {
                path: 'payment/cancel',
                component: PaymentCancelComponent,
            },
        ],
    },
];
