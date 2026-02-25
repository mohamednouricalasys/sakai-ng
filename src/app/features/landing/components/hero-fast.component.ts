import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { TranslatePipe } from '../../../core/shared';
import { FootballHeroSvg } from './svg/football-hero.svg';
import { SvgCheckCircle } from './svg/football-icons.svg';

@Component({
    selector: 'hero-fast',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslatePipe, FootballHeroSvg, SvgCheckCircle],
    template: `
        <section id="hero" aria-label="Hero section" class="hero-section">
            <div class="hero-content">
                <div class="badge-container">
                    <span class="free-badge">{{ 'landing.hero.freeBadge' | translate }}</span>
                    <span class="free-text">{{ 'landing.hero.freeForProfessionals' | translate }}</span>
                </div>

                <h1 class="hero-title">
                    {{ 'landing.hero.title' | translate }}
                </h1>
                <p class="hero-subtitle">
                    {{ 'landing.hero.subtitle' | translate }}
                </p>
                <p class="hero-tagline">
                    {{ 'landing.hero.tagline' | translate }}
                </p>

                <button type="button" class="cta-button" (click)="register()">
                    {{ 'landing.hero.button' | translate }}
                </button>

                <ul class="benefits-list" aria-label="Key benefits">
                    <li class="benefit-item">
                        <svg-check-circle />
                        <span>{{ 'landing.hero.freeHighlight' | translate }}</span>
                    </li>
                    <li class="benefit-item">
                        <svg-check-circle />
                        <span>{{ 'landing.hero.payOnlyContact' | translate }}</span>
                    </li>
                </ul>
            </div>
            <div
                id="hero"
                class="flex flex-col pt-6 px-6 lg:px-20 overflow-hidden"
                style="background: linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), radial-gradient(77.36% 256.97% at 77.36% 57.52%, rgb(238, 239, 175) 0%, rgb(195, 227, 250) 100%); clip-path: ellipse(150% 87% at 93% 13%)"
            >
                <div class="flex justify-center md:justify-end ">
                    <img src="assets/desktop.webp" alt="Hero Image" class="w-9/12" />
                </div>
            </div>
        </section>
    `,
    styles: [
        `
            .hero-section {
                display: flex;
                flex-direction: column;
                padding: 1.5rem;
                overflow: hidden;
                background: linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), radial-gradient(77.36% 256.97% at 77.36% 57.52%, rgb(238, 239, 175) 0%, rgb(195, 227, 250) 100%);
                clip-path: ellipse(150% 87% at 93% 13%);
            }

            @media (min-width: 1024px) {
                .hero-section {
                    padding: 1.5rem 5rem;
                }
            }

            .hero-content {
                margin: 0 1rem;
            }

            @media (min-width: 768px) {
                .hero-content {
                    margin: 1.5rem 5rem 0;
                }
            }

            .badge-container {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 0.5rem;
            }

            @media (min-width: 768px) {
                .badge-container {
                    margin-bottom: 1rem;
                }
            }

            .free-badge {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                color: white;
                font-weight: 700;
                font-size: 0.75rem;
                padding: 0.5rem 1rem;
                border-radius: 9999px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                box-shadow: 0 4px 14px 0 rgba(34, 197, 94, 0.4);
            }

            @media (min-width: 768px) {
                .free-badge {
                    font-size: 0.875rem;
                }
            }

            .free-text {
                color: #15803d;
                font-size: 0.875rem;
                font-weight: 600;
            }

            @media (min-width: 768px) {
                .free-text {
                    font-size: 1.125rem;
                }
            }

            .hero-title {
                font-size: 1.875rem;
                font-weight: 700;
                color: #111827;
                line-height: 1.2;
                margin: 0;
            }

            @media (min-width: 768px) {
                .hero-title {
                    font-size: 3rem;
                }
            }

            @media (min-width: 1024px) {
                .hero-title {
                    font-size: 3.75rem;
                }
            }

            .hero-subtitle {
                font-size: 1.125rem;
                line-height: 1.5;
                margin-top: 0.5rem;
                color: #374151;
            }

            @media (min-width: 768px) {
                .hero-subtitle {
                    font-size: 1.5rem;
                    margin-top: 1rem;
                }
            }

            .hero-tagline {
                font-size: 1rem;
                font-weight: 600;
                line-height: 1.5;
                margin-top: 0.5rem;
                color: var(--p-primary-color, #22c55e);
            }

            @media (min-width: 768px) {
                .hero-tagline {
                    font-size: 1.25rem;
                    margin-top: 0.75rem;
                }
            }

            .cta-button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin-top: 1.5rem;
                padding: 0.75rem 1.5rem;
                font-size: 1rem;
                font-weight: 600;
                color: white;
                background: var(--p-primary-color, #22c55e);
                border: none;
                border-radius: 9999px;
                cursor: pointer;
                transition:
                    transform 0.2s ease,
                    box-shadow 0.2s ease;
            }

            .cta-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            }

            .cta-button:focus-visible {
                outline: 2px solid var(--p-primary-color, #22c55e);
                outline-offset: 2px;
            }

            @media (min-width: 768px) {
                .cta-button {
                    margin-top: 2rem;
                    padding: 0.875rem 2rem;
                    font-size: 1.25rem;
                }
            }

            .benefits-list {
                list-style: none;
                padding: 0;
                margin: 0.75rem 0 0;
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }

            @media (min-width: 768px) {
                .benefits-list {
                    margin-top: 1rem;
                    gap: 0.5rem;
                }
            }

            .benefit-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.75rem;
                color: #4b5563;
            }

            @media (min-width: 768px) {
                .benefit-item {
                    font-size: 0.875rem;
                }
            }

            .hero-illustration {
                display: flex;
                justify-content: center;
                margin-top: 1rem;
                width: 10rem;
                height: 10rem;
                margin-left: auto;
                margin-right: auto;
                opacity: 0.8;
            }

            @media (min-width: 768px) {
                .hero-illustration {
                    justify-content: flex-end;
                    margin-top: 0;
                    width: 18rem;
                    height: 18rem;
                }
            }
        `,
    ],
})
export class HeroFastComponent {
    private keycloakService = inject(KeycloakService);

    register() {
        this.keycloakService.register();
    }
}
