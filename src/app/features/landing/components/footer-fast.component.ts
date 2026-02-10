import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
    selector: 'footer-fast',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterModule],
    template: `
        <footer class="footer" role="contentinfo">
            <div class="footer-content">
                <div class="footer-brand">
                    <a (click)="navigateHome()" class="logo-link" aria-label="Caviar Scout - Back to home">
                        <!-- Inline SVG for faster loading -->
                        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="logo-icon" aria-hidden="true">
                            <circle cx="16" cy="16" r="14" fill="#22c55e" />
                            <path d="M16 8L20 14H12L16 8Z" fill="white" />
                            <circle cx="16" cy="19" r="5" fill="white" opacity="0.9" />
                        </svg>
                        <span class="logo-text">CAVIAR SCOUT</span>
                    </a>
                </div>

                <nav class="footer-nav" aria-label="Legal links">
                    <h4 class="nav-title">{{ t('footer.links.legal') }}</h4>
                    <a routerLink="/landing/privacy" class="nav-link">{{ t('footer.links.privacy') }}</a>
                    <a routerLink="/landing/terms" class="nav-link">{{ t('footer.links.terms') }}</a>
                </nav>
            </div>
        </footer>
    `,
    styles: [`
        .footer {
            padding: 3rem 1.5rem;
            margin-top: 5rem;
        }

        @media (min-width: 1024px) {
            .footer {
                padding: 3rem 5rem;
                margin-left: 5rem;
                margin-right: 5rem;
            }
        }

        .footer-content {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
        }

        @media (min-width: 768px) {
            .footer-content {
                grid-template-columns: auto 1fr;
                gap: 4rem;
            }
        }

        .footer-brand {
            display: flex;
            align-items: flex-start;
        }

        .logo-link {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            text-decoration: none;
            cursor: pointer;
        }

        .logo-icon {
            width: 32px;
            height: 32px;
            flex-shrink: 0;
        }

        .logo-text {
            font-weight: 500;
            font-size: 1.5rem;
            color: var(--p-surface-900, #111827);
            white-space: nowrap;
        }

        :host-context(.dark) .logo-text {
            color: var(--p-surface-0, #f9fafb);
        }

        .footer-nav {
            display: flex;
            flex-direction: column;
            text-align: center;
        }

        @media (min-width: 768px) {
            .footer-nav {
                text-align: left;
            }
        }

        .nav-title {
            font-weight: 500;
            font-size: 1.5rem;
            line-height: 1.5;
            margin: 0 0 1.5rem;
            color: var(--p-surface-900, #111827);
        }

        :host-context(.dark) .nav-title {
            color: var(--p-surface-0, #f9fafb);
        }

        .nav-link {
            display: block;
            font-size: 1.25rem;
            line-height: 1.5;
            margin-bottom: 0.5rem;
            color: var(--p-surface-700, #374151);
            text-decoration: none;
            cursor: pointer;
            transition: color 0.2s;
        }

        .nav-link:hover {
            color: var(--p-primary-color, #22c55e);
        }

        :host-context(.dark) .nav-link {
            color: var(--p-surface-100, #f3f4f6);
        }
    `],
})
export class FooterFastComponent {
    private router = inject(Router);
    private translationService = inject(TranslationService);

    protected t(key: string, params?: Record<string, any>): string {
        return this.translationService.translate(key, params);
    }

    navigateHome() {
        this.router.navigate(['/landing'], { fragment: 'home' });
    }
}
