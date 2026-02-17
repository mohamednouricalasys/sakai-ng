import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { TranslatePipe } from '../../../core/shared';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
    selector: 'topbar-fast',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslatePipe],
    template: `
        <a class="logo-link" href="#">
            <img src="assets/favicon-32x32.png" alt="Caviar Scout" class="logo-icon" width="32" height="32" />
            <span class="logo-text">CAVIAR SCOUT</span>
        </a>

        <button type="button" class="menu-toggle" (click)="toggleMenu()" aria-label="Toggle menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="menu-icon" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round" />
            </svg>
        </button>

        <nav class="nav-container" [class.nav-open]="menuOpen" role="navigation">
            <div class="nav-actions">
                <button type="button" class="btn-text" (click)="login()">
                    {{ 'auth.login' | translate }}
                </button>
                <button type="button" class="btn-primary" (click)="register()">
                    {{ 'auth.register' | translate }}
                </button>
                <select class="lang-select" (change)="onLanguageChange($event)">
                    @for (lang of languages; track lang.value) {
                        <option [value]="lang.value" [selected]="lang.value === currentLang()">{{ lang.label }}</option>
                    }
                </select>
            </div>
        </nav>
    `,
    styles: [`
        :host {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            width: 100%;
        }

        .logo-link {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            text-decoration: none;
        }

        .logo-icon {
            width: 32px;
            height: 32px;
        }

        .logo-text {
            color: var(--p-surface-900, #111827);
            font-weight: 500;
            font-size: 1.5rem;
            line-height: 1.5;
            white-space: nowrap;
        }

        :host-context(.dark) .logo-text {
            color: var(--p-surface-0, #f9fafb);
        }

        .menu-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0.5rem;
            background: transparent;
            border: none;
            border-radius: 9999px;
            cursor: pointer;
            color: var(--p-surface-900, #111827);
        }

        :host-context(.dark) .menu-toggle {
            color: var(--p-surface-0, #f9fafb);
        }

        @media (min-width: 1024px) {
            .menu-toggle {
                display: none;
            }
        }

        .menu-icon {
            width: 1.5rem;
            height: 1.5rem;
        }

        .nav-container {
            display: none;
            flex-grow: 1;
            align-items: center;
            justify-content: flex-end;
            width: 100%;
            background: var(--p-surface-0, #ffffff);
            padding: 1rem;
            border-radius: 0.5rem;
            margin-top: 1rem;
        }

        :host-context(.dark) .nav-container {
            background: var(--p-surface-900, #111827);
        }

        .nav-container.nav-open {
            display: flex;
        }

        @media (min-width: 1024px) {
            .nav-container {
                display: flex;
                width: auto;
                position: static;
                padding: 0;
                margin-top: 0;
                background: transparent;
            }
        }

        .nav-actions {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            width: 100%;
        }

        @media (min-width: 1024px) {
            .nav-actions {
                flex-direction: row;
                align-items: center;
                width: auto;
            }
        }

        .btn-text {
            padding: 0.5rem 1rem;
            background: transparent;
            border: none;
            border-radius: 9999px;
            color: var(--p-surface-900, #111827);
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .btn-text:hover {
            background: var(--p-surface-100, #f3f4f6);
        }

        :host-context(.dark) .btn-text {
            color: var(--p-surface-0, #f9fafb);
        }

        :host-context(.dark) .btn-text:hover {
            background: var(--p-surface-800, #1f2937);
        }

        .btn-primary {
            padding: 0.5rem 1rem;
            background: var(--p-primary-color, #22c55e);
            border: none;
            border-radius: 9999px;
            color: white;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s, transform 0.2s;
        }

        .btn-primary:hover {
            background: var(--p-primary-600, #16a34a);
            transform: translateY(-1px);
        }

        .btn-primary:focus-visible {
            outline: 2px solid var(--p-primary-color, #22c55e);
            outline-offset: 2px;
        }

        .lang-select {
            padding: 0.375rem 0.75rem;
            border: 1px solid var(--p-surface-300, #d1d5db);
            border-radius: 0.5rem;
            background: var(--p-surface-0, #ffffff);
            color: var(--p-surface-900, #111827);
            font-size: 0.875rem;
            cursor: pointer;
        }

        :host-context(.dark) .lang-select {
            background: var(--p-surface-800, #1f2937);
            color: var(--p-surface-0, #f9fafb);
            border-color: var(--p-surface-600, #4b5563);
        }
    `],
})
export class TopbarFastComponent {
    private keycloakService = inject(KeycloakService);
    private router = inject(Router);
    private translationService = inject(TranslationService);

    currentLang = this.translationService.currentLanguage;

    languages = [
        { label: 'English', value: 'en' },
        { label: 'Français', value: 'fr' },
        { label: 'Español', value: 'es' },
        { label: 'العربية', value: 'ar' },
        { label: 'Deutsch', value: 'de' },
        { label: 'Suomi', value: 'fi' },
        { label: 'Italiano', value: 'it' },
        { label: 'Nederlands', value: 'nl' },
        { label: 'Português', value: 'pt' },
        { label: 'Türkçe', value: 'tr' },
        { label: '中文', value: 'zh' },
    ];

    menuOpen = false;

    toggleMenu() {
        this.menuOpen = !this.menuOpen;
    }

    onLanguageChange(event: Event) {
        const value = (event.target as HTMLSelectElement).value;
        this.translationService.setLanguage(value);
    }

    login() {
        this.keycloakService.login();
    }

    register() {
        this.keycloakService.register();
    }
}
