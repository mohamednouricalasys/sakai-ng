import { Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TopbarWidget } from './components/topbarwidget.component';
import { HeroWidgetComponent } from './components/herowidget.component';
import { FeaturesWidgetComponent } from './components/featureswidget.component';
import { PricingWidgetComponent } from './components/pricingwidget.component';
import { FooterWidgetComponent } from './components/footerwidget.component';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [RouterModule, TopbarWidget, HeroWidgetComponent, FeaturesWidgetComponent, PricingWidgetComponent, FooterWidgetComponent],
    template: `
        <div class="bg-surface-0 dark:bg-surface-900">
            <div id="home" class="landing-wrapper overflow-hidden">
                <header class="py-6 px-6 mx-0 md:mx-12 lg:mx-20 lg:px-20 flex items-center justify-between relative lg:static">
                    <topbar-widget class="flex flex-row justify-between w-full" />
                </header>
                <main>
                    <hero-widget />

                    @defer (on viewport) {
                        <features-widget />
                    } @placeholder {
                        <div class="min-h-96 animate-pulse bg-surface-100 dark:bg-surface-800" aria-hidden="true"></div>
                    }

                    @defer (on viewport) {
                        <pricing-widget />
                    } @placeholder {
                        <div class="min-h-64 animate-pulse bg-surface-100 dark:bg-surface-800" aria-hidden="true"></div>
                    }
                </main>

                @defer (on viewport) {
                    <footer-widget />
                } @placeholder {
                    <div class="min-h-48 animate-pulse bg-surface-100 dark:bg-surface-800" aria-hidden="true"></div>
                }
            </div>
        </div>
    `,
    encapsulation: ViewEncapsulation.None,
})
export class LandingComponent {}
