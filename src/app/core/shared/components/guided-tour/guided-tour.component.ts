import { Component, inject, effect, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { GuidedTourService } from '../../../services/guided-tour.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
    selector: 'p-guided-tour',
    standalone: true,
    imports: [CommonModule, ButtonModule, TranslatePipe],
    template: `
        @if (tourService.active() && tourService.currentStep(); as step) {
            <div class="tour-overlay" (click)="onOverlayClick($event)"></div>
            <div class="tour-tooltip" [class]="'tour-tooltip-' + (step.position || 'bottom')" [style]="tooltipStyle">
                <div class="tour-content">
                    <h4 class="tour-title">{{ step.titleKey | translate }}</h4>
                    <p class="tour-description">{{ step.descriptionKey | translate }}</p>
                </div>
                <div class="tour-footer">
                    <span class="tour-progress">{{ tourService.progress().current }}/{{ tourService.progress().total }}</span>
                    <div class="tour-actions">
                        <button pButton type="button" class="p-button-text p-button-sm tour-skip" (click)="skip()" [label]="'tour.skip' | translate"></button>
                        @if (!tourService.isFirstStep()) {
                            <button pButton type="button" class="p-button-outlined p-button-sm" (click)="prev()" icon="pi pi-chevron-left"></button>
                        }
                        <button pButton type="button" class="p-button-sm" (click)="next()" [icon]="tourService.isLastStep() ? 'pi pi-check' : 'pi pi-chevron-right'" [iconPos]="'right'"></button>
                    </div>
                </div>
            </div>
        }
    `,
    styles: [
        `
            .tour-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 9998;
            }

            .tour-tooltip {
                position: fixed;
                z-index: 9999;
                background: var(--p-surface-0);
                border-radius: 12px;
                padding: 1rem;
                max-width: 320px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                animation: tourFadeIn 0.2s ease-out;
            }

            @keyframes tourFadeIn {
                from {
                    opacity: 0;
                    transform: translateY(8px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .tour-title {
                margin: 0 0 0.5rem 0;
                font-size: 1rem;
                font-weight: 600;
                color: var(--p-primary-color);
            }

            .tour-description {
                margin: 0;
                font-size: 0.875rem;
                color: var(--p-text-muted-color);
                line-height: 1.5;
            }

            .tour-footer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-top: 1rem;
                padding-top: 0.75rem;
                border-top: 1px solid var(--p-surface-200);
            }

            .tour-progress {
                font-size: 0.75rem;
                color: var(--p-text-muted-color);
            }

            .tour-actions {
                display: flex;
                gap: 0.5rem;
                align-items: center;
            }

            .tour-skip {
                color: var(--p-text-muted-color) !important;
            }
        `,
    ],
})
export class GuidedTourComponent {
    tourService = inject(GuidedTourService);
    tooltipStyle: Record<string, string> = {};

    constructor() {
        effect(() => {
            const step = this.tourService.currentStep();
            if (step) {
                setTimeout(() => this.positionTooltip(step.target, step.position), 50);
            }
        });
    }

    @HostListener('window:resize')
    onResize() {
        const step = this.tourService.currentStep();
        if (step) {
            this.positionTooltip(step.target, step.position);
        }
    }

    private positionTooltip(targetSelector: string, position: string = 'bottom') {
        const target = document.querySelector(targetSelector);
        if (!target) {
            this.tooltipStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
            return;
        }

        const rect = target.getBoundingClientRect();
        const tooltipWidth = 320;
        const tooltipHeight = 160;
        const gap = 12;

        let top: number;
        let left: number;

        switch (position) {
            case 'top':
                top = rect.top - tooltipHeight - gap;
                left = rect.left + rect.width / 2 - tooltipWidth / 2;
                break;
            case 'left':
                top = rect.top + rect.height / 2 - tooltipHeight / 2;
                left = rect.left - tooltipWidth - gap;
                break;
            case 'right':
                top = rect.top + rect.height / 2 - tooltipHeight / 2;
                left = rect.right + gap;
                break;
            default:
                top = rect.bottom + gap;
                left = rect.left + rect.width / 2 - tooltipWidth / 2;
        }

        left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
        top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));

        this.tooltipStyle = { top: `${top}px`, left: `${left}px` };

        (target as HTMLElement).style.position = 'relative';
        (target as HTMLElement).style.zIndex = '9999';
    }

    next() {
        this.clearHighlight();
        this.tourService.nextStep();
    }

    prev() {
        this.clearHighlight();
        this.tourService.previousStep();
    }

    skip() {
        this.clearHighlight();
        this.tourService.skipTour();
    }

    onOverlayClick(event: MouseEvent) {
        event.stopPropagation();
    }

    private clearHighlight() {
        const step = this.tourService.currentStep();
        if (step) {
            const target = document.querySelector(step.target) as HTMLElement;
            if (target) {
                target.style.position = '';
                target.style.zIndex = '';
            }
        }
    }
}
