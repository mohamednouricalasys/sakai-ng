import { Component, ViewEncapsulation, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { TopbarFastComponent } from './components/topbar-fast.component';
import { HeroFastComponent } from './components/hero-fast.component';
import { FeaturesFastComponent } from './components/features-fast.component';
import { FooterFastComponent } from './components/footer-fast.component';

/**
 * Ultra-fast landing page optimized for low-bandwidth regions (Africa, etc.)
 *
 * Optimizations:
 * - Inline SVGs instead of external images (~90% smaller than PNGs)
 * - Minimal dependencies (no PrimeNG buttons in critical path)
 * - OnPush change detection for all components
 * - CSS-only animations (no JS animations)
 * - Mobile-first responsive design
 * - Deferred loading for non-critical sections
 * - No Pricing section (removed as per requirements)
 * - SEO meta tags for better discoverability
 * - Core Web Vitals optimized (LCP, FID, CLS)
 */
@Component({
    selector: 'app-landing-fast',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        TopbarFastComponent,
        HeroFastComponent,
        FeaturesFastComponent,
        FooterFastComponent,
    ],
    template: `
        <div class="landing-fast">
            <div id="home" class="landing-wrapper">
                <header class="header">
                    <topbar-fast />
                </header>

                <main>
                    <hero-fast />

                    @defer (on viewport; prefetch on idle) {
                        <features-fast />
                    } @placeholder {
                        <div class="placeholder placeholder-features" aria-hidden="true"></div>
                    }
                </main>

                @defer (on viewport; prefetch on idle) {
                    <footer-fast />
                } @placeholder {
                    <div class="placeholder placeholder-footer" aria-hidden="true"></div>
                }
            </div>
        </div>
    `,
    styles: [`
        .landing-fast {
            background: var(--p-surface-0, #ffffff);
            min-height: 100vh;
        }

        :host-context(.dark) .landing-fast {
            background: var(--p-surface-900, #111827);
        }

        .landing-wrapper {
            overflow: hidden;
        }

        .header {
            padding: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
        }

        @media (min-width: 768px) {
            .header {
                margin: 0 3rem;
            }
        }

        @media (min-width: 1024px) {
            .header {
                margin: 0 5rem;
                padding: 1.5rem 5rem;
            }
        }

        .placeholder {
            background: var(--p-surface-100, #f3f4f6);
        }

        :host-context(.dark) .placeholder {
            background: var(--p-surface-800, #1f2937);
        }

        .placeholder-features {
            min-height: 24rem;
        }

        .placeholder-footer {
            min-height: 12rem;
        }
    `],
    encapsulation: ViewEncapsulation.None,
})
export class LandingFastComponent implements OnInit {
    private meta = inject(Meta);
    private title = inject(Title);

    ngOnInit(): void {
        this.setupSeoMetaTags();
    }

    private setupSeoMetaTags(): void {
        this.title.setTitle('Caviar Scout - Plateforme de Recrutement de Talents Sportifs');

        this.meta.updateTag({
            name: 'description',
            content: 'Caviar Scout aide les recruteurs, agents et clubs a identifier, analyser et comparer les jeunes talents grace a des videos structurees et des donnees fiables.',
        });

        this.meta.updateTag({
            name: 'keywords',
            content: 'football, soccer, talent scout, recrutement, sports, Afrique, Senegal, Cameroun, Cote d\'Ivoire, jeunes talents',
        });

        // Open Graph tags for social sharing
        this.meta.updateTag({ property: 'og:title', content: 'Caviar Scout - Recrutement de Talents Sportifs' });
        this.meta.updateTag({ property: 'og:description', content: 'Identifiez et recrutez les meilleurs jeunes talents sportifs.' });
        this.meta.updateTag({ property: 'og:type', content: 'website' });

        // Twitter Card
        this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
        this.meta.updateTag({ name: 'twitter:title', content: 'Caviar Scout - Recrutement de Talents' });

        // Mobile optimization
        this.meta.updateTag({ name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' });
        this.meta.updateTag({ name: 'theme-color', content: '#22c55e' });

        // Performance hints
        this.meta.updateTag({ name: 'format-detection', content: 'telephone=no' });
    }
}
