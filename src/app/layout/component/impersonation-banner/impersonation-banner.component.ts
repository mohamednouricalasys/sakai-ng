import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ImpersonationService } from '../../../core/services/impersonation.service';
import { TranslatePipe } from '../../../core/shared';

@Component({
    selector: 'app-impersonation-banner',
    standalone: true,
    imports: [CommonModule, ButtonModule, TranslatePipe],
    template: `
        @if (impersonationService.isImpersonating()) {
            <div class="impersonation-banner">
                <div class="flex items-center justify-between w-full px-4 py-2">
                    <div class="flex items-center gap-2">
                        <i class="pi pi-eye text-lg"></i>
                        <span>
                            {{ 'admin.impersonation.banner' | translate }}
                            <strong>{{ impersonationService.getImpersonatedUserDisplayName() }}</strong>
                        </span>
                    </div>
                    <p-button icon="pi pi-times" [label]="'admin.impersonation.stop' | translate" severity="secondary" size="small" (onClick)="stopViewAs()" [text]="true" />
                </div>
            </div>
        }
    `,
    styles: [
        `
            .impersonation-banner {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 9999;
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                color: white;
                font-weight: 500;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            }

            :host ::ng-deep .p-button-text {
                color: white !important;
            }

            :host ::ng-deep .p-button-text:hover {
                background: rgba(255, 255, 255, 0.1) !important;
            }
        `,
    ],
})
export class ImpersonationBannerComponent {
    readonly impersonationService = inject(ImpersonationService);

    async stopViewAs(): Promise<void> {
        await this.impersonationService.stopViewAs();
    }
}
