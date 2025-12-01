import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { HeroWidgetComponent } from './components/herowidget.component';
import { FeaturesWidgetComponent } from './components/featureswidget.component';
import { PricingWidgetComponent } from './components/pricingwidget.component';
import { FooterWidgetComponent } from './components/footerwidget.component';
import { TopbarWidget } from './components/topbarwidget.component';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [RouterModule, TopbarWidget, HeroWidgetComponent, FeaturesWidgetComponent, PricingWidgetComponent, FooterWidgetComponent, RippleModule, StyleClassModule, ButtonModule, DividerModule],
    template: `
        <div class="bg-surface-0 dark:bg-surface-900">
            <div id="home" class="landing-wrapper overflow-hidden">
                <topbar-widget class="py-6 px-6 mx-0 md:mx-12 lg:mx-20 lg:px-20 flex items-center justify-between relative lg:static" />
                <hero-widget />
                <features-widget />
                <pricing-widget />
                <footer-widget />
            </div>
        </div>
    `,
})
export class LandingComponent {}
