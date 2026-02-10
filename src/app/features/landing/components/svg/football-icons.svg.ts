import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
    selector: 'svg-icon-free',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="24" cy="24" r="20" fill="#dcfce7" />
            <path d="M24 14L28 22H20L24 14Z" fill="#22c55e" />
            <circle cx="24" cy="28" r="6" fill="#22c55e" />
            <path d="M18 32L24 38L30 32" stroke="#16a34a" stroke-width="2" fill="none" />
        </svg>
    `,
})
export class SvgIconFree {}

@Component({
    selector: 'svg-icon-verified',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="24" cy="24" r="20" fill="#fef3c7" />
            <path d="M24 12L27 18L34 19L29 24L30 31L24 28L18 31L19 24L14 19L21 18L24 12Z" fill="#f59e0b" opacity="0.6" />
            <path d="M18 24L22 28L30 20" stroke="#d97706" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
        </svg>
    `,
})
export class SvgIconVerified {}

@Component({
    selector: 'svg-icon-filter',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="24" cy="24" r="20" fill="#cffafe" />
            <rect x="14" y="16" width="20" height="3" rx="1.5" fill="#0891b2" opacity="0.6" />
            <rect x="18" y="22" width="12" height="3" rx="1.5" fill="#0891b2" opacity="0.8" />
            <rect x="21" y="28" width="6" height="3" rx="1.5" fill="#0891b2" />
            <!-- Football pattern -->
            <circle cx="36" cy="36" r="6" stroke="#06b6d4" stroke-width="1.5" fill="none" />
        </svg>
    `,
})
export class SvgIconFilter {}

@Component({
    selector: 'svg-icon-contact',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="24" cy="24" r="20" fill="#e0e7ff" />
            <circle cx="24" cy="18" r="6" fill="#6366f1" opacity="0.6" />
            <path d="M14 36C14 30 18 26 24 26C30 26 34 30 34 36" stroke="#4f46e5" stroke-width="2.5" fill="none" />
            <!-- Connection lines -->
            <path d="M36 16L40 12" stroke="#818cf8" stroke-width="1.5" />
            <path d="M38 22L42 22" stroke="#818cf8" stroke-width="1.5" />
        </svg>
    `,
})
export class SvgIconContact {}

@Component({
    selector: 'svg-icon-video',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="24" cy="24" r="20" fill="#e2e8f0" />
            <rect x="12" y="16" width="18" height="14" rx="2" fill="#64748b" opacity="0.6" />
            <polygon points="34,18 42,14 42,32 34,28" fill="#475569" />
            <!-- Play button -->
            <polygon points="19,20 19,28 26,24" fill="#fff" />
        </svg>
    `,
})
export class SvgIconVideo {}

@Component({
    selector: 'svg-check-circle',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="w-4 h-4 md:w-5 md:h-5 flex-shrink-0">
            <circle cx="10" cy="10" r="9" fill="#dcfce7" />
            <path d="M6 10L9 13L14 7" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    `,
})
export class SvgCheckCircle {}
