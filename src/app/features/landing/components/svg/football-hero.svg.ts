import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'svg-football-hero',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            class="w-full h-full"
        >
            <!-- Abstract football field pattern -->
            <circle cx="100" cy="100" r="90" stroke="#22c55e" stroke-width="2" fill="none" opacity="0.3" />
            <circle cx="100" cy="100" r="70" stroke="#22c55e" stroke-width="1.5" fill="none" opacity="0.4" />
            <circle cx="100" cy="100" r="50" stroke="#22c55e" stroke-width="1" fill="none" opacity="0.5" />

            <!-- Abstract football -->
            <circle cx="100" cy="100" r="30" fill="#22c55e" opacity="0.15" />
            <path d="M100 70 L115 85 L115 115 L100 130 L85 115 L85 85 Z" fill="#22c55e" opacity="0.3" />

            <!-- Dynamic lines representing movement -->
            <path d="M30 100 Q50 80 70 100" stroke="#16a34a" stroke-width="2" fill="none" opacity="0.4" />
            <path d="M130 100 Q150 120 170 100" stroke="#16a34a" stroke-width="2" fill="none" opacity="0.4" />

            <!-- Abstract player silhouettes -->
            <circle cx="60" cy="60" r="8" fill="#15803d" opacity="0.3" />
            <circle cx="140" cy="60" r="8" fill="#15803d" opacity="0.3" />
            <circle cx="60" cy="140" r="8" fill="#15803d" opacity="0.3" />
            <circle cx="140" cy="140" r="8" fill="#15803d" opacity="0.3" />

            <!-- Central pentagon (football pattern) -->
            <polygon points="100,80 118,92 112,115 88,115 82,92" fill="#22c55e" opacity="0.2" />
        </svg>
    `,
})
export class FootballHeroSvg {}
