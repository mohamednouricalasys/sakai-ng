import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '../../../core/shared';
import { SvgIconFree, SvgIconVerified, SvgIconFilter, SvgIconContact, SvgIconVideo } from './svg/football-icons.svg';

@Component({
    selector: 'features-fast',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslatePipe, SvgIconFree, SvgIconVerified, SvgIconFilter, SvgIconContact, SvgIconVideo],
    template: `
        <section id="features" class="features-section" aria-labelledby="features-title">
            <div class="features-header">
                <h2 id="features-title" class="features-title">{{ 'features.title' | translate }}</h2>
                <p class="features-subtitle">{{ 'features.subtitle' | translate }}</p>
            </div>

            <!-- Main Free Access Card -->
            <article class="feature-card-main">
                <div class="feature-card-main-inner">
                    <div class="feature-icon-large">
                        <svg-icon-free />
                    </div>
                    <div class="feature-content-main">
                        <div class="feature-header-main">
                            <h3 class="feature-title-main">{{ 'features.free.title' | translate }}</h3>
                            <span class="free-badge-small">{{ 'landing.hero.freeBadge' | translate }}</span>
                        </div>
                        <p class="feature-desc-main">{{ 'features.free.description' | translate }}</p>
                    </div>
                </div>
            </article>

            <!-- Feature Grid -->
            <div class="features-grid">
                <article class="feature-card feature-card-yellow">
                    <div class="feature-icon">
                        <svg-icon-verified />
                    </div>
                    <h3 class="feature-title">{{ 'features.database.title' | translate }}</h3>
                    <p class="feature-desc">{{ 'features.database.description' | translate }}</p>
                </article>

                <article class="feature-card feature-card-cyan">
                    <div class="feature-icon">
                        <svg-icon-filter />
                    </div>
                    <h3 class="feature-title">{{ 'features.filters.title' | translate }}</h3>
                    <p class="feature-desc">{{ 'features.filters.description' | translate }}</p>
                </article>

                <article class="feature-card feature-card-indigo">
                    <div class="feature-icon">
                        <svg-icon-contact />
                    </div>
                    <h3 class="feature-title">{{ 'features.contact.title' | translate }}</h3>
                    <p class="feature-desc">{{ 'features.contact.description' | translate }}</p>
                </article>

                <article class="feature-card feature-card-slate">
                    <div class="feature-icon">
                        <svg-icon-video />
                    </div>
                    <h3 class="feature-title">{{ 'features.analysis.title' | translate }}</h3>
                    <p class="feature-desc">{{ 'features.analysis.description' | translate }}</p>
                </article>
            </div>
        </section>
    `,
    styles: [`
        .features-section {
            padding: 1.5rem;
            margin: 2rem 0 0;
        }

        @media (min-width: 1024px) {
            .features-section {
                padding: 1.5rem 5rem;
                margin: 2rem 5rem 0;
            }
        }

        .features-header {
            text-align: center;
            margin-bottom: 1.5rem;
        }

        @media (min-width: 768px) {
            .features-header {
                margin-top: 5rem;
                margin-bottom: 2rem;
            }
        }

        .features-title {
            font-size: 1.5rem;
            font-weight: 400;
            color: var(--p-surface-900, #111827);
            margin: 0 0 0.5rem;
        }

        @media (min-width: 768px) {
            .features-title {
                font-size: 2.25rem;
            }
        }

        :host-context(.dark) .features-title {
            color: var(--p-surface-0, #f9fafb);
        }

        .features-subtitle {
            font-size: 1.125rem;
            color: var(--p-text-muted-color, #6b7280);
            margin: 0;
        }

        @media (min-width: 768px) {
            .features-subtitle {
                font-size: 1.5rem;
            }
        }

        .feature-card-main {
            padding: 3px;
            border-radius: 12px;
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%);
            margin-bottom: 1.5rem;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .feature-card-main:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 40px rgba(34,197,94,0.25);
        }

        .feature-card-main-inner {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
            padding: 1.5rem;
            background: var(--p-surface-0, #ffffff);
            border-radius: 10px;
        }

        @media (min-width: 768px) {
            .feature-card-main-inner {
                flex-direction: row;
            }
        }

        :host-context(.dark) .feature-card-main-inner {
            background: var(--p-surface-900, #111827);
        }

        .feature-icon-large {
            width: 5rem;
            height: 5rem;
            flex-shrink: 0;
        }

        .feature-content-main {
            flex: 1;
            text-align: center;
        }

        @media (min-width: 768px) {
            .feature-content-main {
                text-align: left;
            }
        }

        .feature-header-main {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            margin-bottom: 0.5rem;
        }

        @media (min-width: 768px) {
            .feature-header-main {
                justify-content: flex-start;
            }
        }

        .feature-title-main {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--p-surface-900, #111827);
            margin: 0;
        }

        :host-context(.dark) .feature-title-main {
            color: var(--p-surface-0, #f9fafb);
        }

        .free-badge-small {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: white;
            font-weight: 700;
            font-size: 0.75rem;
            padding: 0.35rem 0.75rem;
            border-radius: 9999px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            box-shadow: 0 2px 8px 0 rgba(34,197,94,0.3);
        }

        .feature-desc-main {
            font-size: 1.125rem;
            color: var(--p-surface-600, #4b5563);
            margin: 0;
        }

        :host-context(.dark) .feature-desc-main {
            color: var(--p-surface-200, #e5e7eb);
        }

        .features-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
        }

        @media (min-width: 768px) {
            .features-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (min-width: 1024px) {
            .features-grid {
                grid-template-columns: repeat(4, 1fr);
            }
        }

        .feature-card {
            padding: 2px;
            border-radius: 10px;
            min-height: 160px;
        }

        .feature-card-yellow {
            background: linear-gradient(90deg, rgba(253,228,165,0.3), rgba(187,199,205,0.3)),
                        linear-gradient(180deg, rgba(253,228,165,0.3), rgba(187,199,205,0.3));
        }

        .feature-card-cyan {
            background: linear-gradient(90deg, rgba(145,226,237,0.3), rgba(251,199,145,0.3)),
                        linear-gradient(180deg, rgba(253,228,165,0.3), rgba(172,180,223,0.3));
        }

        .feature-card-indigo {
            background: linear-gradient(90deg, rgba(145,226,237,0.3), rgba(172,180,223,0.3)),
                        linear-gradient(180deg, rgba(172,180,223,0.3), rgba(246,158,188,0.3));
        }

        .feature-card-slate {
            background: linear-gradient(90deg, rgba(187,199,205,0.3), rgba(251,199,145,0.3)),
                        linear-gradient(180deg, rgba(253,228,165,0.3), rgba(145,210,204,0.3));
        }

        .feature-card > * {
            background: var(--p-surface-0, #ffffff);
            border-radius: 8px;
        }

        :host-context(.dark) .feature-card > * {
            background: var(--p-surface-900, #111827);
        }

        .feature-card {
            display: flex;
            flex-direction: column;
        }

        .feature-card > .feature-icon,
        .feature-card > .feature-title,
        .feature-card > .feature-desc {
            background: transparent;
        }

        .feature-card {
            padding: 1rem;
            background: var(--p-surface-0, #ffffff);
            border: 2px solid transparent;
            background-clip: padding-box;
        }

        :host-context(.dark) .feature-card {
            background: var(--p-surface-900, #111827);
        }

        .feature-icon {
            width: 3.5rem;
            height: 3.5rem;
            margin-bottom: 1rem;
        }

        .feature-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--p-surface-900, #111827);
            margin: 0 0 0.5rem;
        }

        :host-context(.dark) .feature-title {
            color: var(--p-surface-0, #f9fafb);
        }

        .feature-desc {
            font-size: 0.875rem;
            color: var(--p-surface-600, #4b5563);
            margin: 0;
            line-height: 1.5;
        }

        :host-context(.dark) .feature-desc {
            color: var(--p-surface-200, #e5e7eb);
        }
    `],
})
export class FeaturesFastComponent {}
