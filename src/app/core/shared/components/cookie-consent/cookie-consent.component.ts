import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { CookieConsentService, CookiePreferences } from '../../../services/cookie-consent.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
    selector: 'p-cookie-consent',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, CheckboxModule, TranslatePipe],
    template: `
        @if (cookieService.showBanner()) {
            <div class="cookie-overlay"></div>
            <div class="cookie-banner">
                <div class="cookie-content">
                    <div class="cookie-header">
                        <i class="pi pi-shield cookie-icon"></i>
                        <h3 class="cookie-title">{{ 'cookies.title' | translate }}</h3>
                    </div>
                    <p class="cookie-description">{{ 'cookies.description' | translate }}</p>

                    @if (showPreferences()) {
                        <div class="cookie-preferences">
                            <div class="preference-item">
                                <p-checkbox [(ngModel)]="preferences.necessary" [binary]="true" [disabled]="true" inputId="necessary"></p-checkbox>
                                <label for="necessary" class="preference-label">
                                    <span class="preference-name">{{ 'cookies.necessary' | translate }}</span>
                                    <span class="preference-desc">{{ 'cookies.necessaryDesc' | translate }}</span>
                                </label>
                            </div>
                            <div class="preference-item">
                                <p-checkbox [(ngModel)]="preferences.analytics" [binary]="true" inputId="analytics"></p-checkbox>
                                <label for="analytics" class="preference-label">
                                    <span class="preference-name">{{ 'cookies.analytics' | translate }}</span>
                                    <span class="preference-desc">{{ 'cookies.analyticsDesc' | translate }}</span>
                                </label>
                            </div>
                            <div class="preference-item">
                                <p-checkbox [(ngModel)]="preferences.marketing" [binary]="true" inputId="marketing"></p-checkbox>
                                <label for="marketing" class="preference-label">
                                    <span class="preference-name">{{ 'cookies.marketing' | translate }}</span>
                                    <span class="preference-desc">{{ 'cookies.marketingDesc' | translate }}</span>
                                </label>
                            </div>
                        </div>
                    }
                </div>

                <div class="cookie-actions">
                    @if (!showPreferences()) {
                        <button pButton type="button" class="p-button-text p-button-sm" (click)="togglePreferences()" [label]="'cookies.customize' | translate"></button>
                    }
                    <div class="cookie-buttons">
                        @if (showPreferences()) {
                            <button pButton type="button" class="p-button-outlined p-button-sm" (click)="saveCustomPreferences()" [label]="'cookies.savePreferences' | translate"></button>
                        }
                        <button pButton type="button" class="p-button-outlined p-button-sm" (click)="rejectAll()" [label]="'cookies.rejectAll' | translate"></button>
                        <button pButton type="button" class="p-button-sm" (click)="acceptAll()" [label]="'cookies.acceptAll' | translate"></button>
                    </div>
                </div>
            </div>
        }
    `,
    styles: [
        `
            .cookie-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.4);
                z-index: 9998;
                animation: fadeIn 0.3s ease-out;
            }

            .cookie-banner {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: var(--p-surface-0);
                padding: 1.5rem;
                box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
                z-index: 9999;
                animation: slideUp 0.3s ease-out;
            }

            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }

            @keyframes slideUp {
                from {
                    transform: translateY(100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            .cookie-content {
                max-width: 1200px;
                margin: 0 auto;
            }

            .cookie-header {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                margin-bottom: 0.75rem;
            }

            .cookie-icon {
                font-size: 1.5rem;
                color: var(--p-primary-color);
            }

            .cookie-title {
                margin: 0;
                font-size: 1.125rem;
                font-weight: 600;
                color: var(--p-text-color);
            }

            .cookie-description {
                margin: 0 0 1rem 0;
                font-size: 0.875rem;
                color: var(--p-text-muted-color);
                line-height: 1.5;
            }

            .cookie-preferences {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
                margin-bottom: 1rem;
                padding: 1rem;
                background: var(--p-surface-50);
                border-radius: 8px;
            }

            .preference-item {
                display: flex;
                align-items: flex-start;
                gap: 0.75rem;
            }

            .preference-label {
                display: flex;
                flex-direction: column;
                gap: 0.125rem;
                cursor: pointer;
            }

            .preference-name {
                font-size: 0.875rem;
                font-weight: 500;
                color: var(--p-text-color);
            }

            .preference-desc {
                font-size: 0.75rem;
                color: var(--p-text-muted-color);
            }

            .cookie-actions {
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 0.75rem;
                max-width: 1200px;
                margin: 0 auto;
            }

            .cookie-buttons {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }

            @media (max-width: 768px) {
                .cookie-banner {
                    padding: 1rem;
                }

                .cookie-actions {
                    flex-direction: column;
                    align-items: stretch;
                }

                .cookie-buttons {
                    flex-direction: column;
                }

                .cookie-buttons button {
                    width: 100%;
                }
            }
        `,
    ],
})
export class CookieConsentComponent {
    cookieService = inject(CookieConsentService);
    showPreferences = signal(false);

    preferences: CookiePreferences = {
        necessary: true,
        analytics: false,
        marketing: false,
    };

    togglePreferences(): void {
        this.showPreferences.set(!this.showPreferences());
    }

    acceptAll(): void {
        this.cookieService.acceptAll();
    }

    rejectAll(): void {
        this.cookieService.rejectAll();
    }

    saveCustomPreferences(): void {
        this.cookieService.savePreferences({ ...this.preferences });
    }
}
