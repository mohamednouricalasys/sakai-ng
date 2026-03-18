import { Injectable, signal, computed } from '@angular/core';

export interface TourStep {
    target: string;
    titleKey: string;
    descriptionKey: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export interface Tour {
    id: string;
    steps: TourStep[];
}

const TOURS: Record<string, Tour> = {
    gallery: {
        id: 'gallery',
        steps: [
            { target: '.app-search-container', titleKey: 'tour.gallery.search.title', descriptionKey: 'tour.gallery.search.description', position: 'bottom' },
            { target: '.app-filter-group', titleKey: 'tour.gallery.filters.title', descriptionKey: 'tour.gallery.filters.description', position: 'bottom' },
        ],
    },
    prodige: {
        id: 'prodige',
        steps: [
            { target: '.app-hero-btn', titleKey: 'tour.prodige.create.title', descriptionKey: 'tour.prodige.create.description', position: 'bottom' },
            { target: '.app-controls-card', titleKey: 'tour.prodige.controls.title', descriptionKey: 'tour.prodige.controls.description', position: 'bottom' },
        ],
    },
    video: {
        id: 'video',
        steps: [
            { target: '.app-prodige-control', titleKey: 'tour.video.select.title', descriptionKey: 'tour.video.select.description', position: 'bottom' },
            { target: '.app-add-btn', titleKey: 'tour.video.add.title', descriptionKey: 'tour.video.add.description', position: 'bottom' },
        ],
    },
};

const STORAGE_KEY = 'caviar_scout_tours_seen';

@Injectable({ providedIn: 'root' })
export class GuidedTourService {
    private currentTour = signal<Tour | null>(null);
    private currentStepIndex = signal(0);
    private isActive = signal(false);

    readonly tour = this.currentTour.asReadonly();
    readonly stepIndex = this.currentStepIndex.asReadonly();
    readonly active = this.isActive.asReadonly();

    readonly currentStep = computed(() => {
        const tour = this.currentTour();
        const index = this.currentStepIndex();
        return tour?.steps[index] ?? null;
    });

    readonly isLastStep = computed(() => {
        const tour = this.currentTour();
        return tour ? this.currentStepIndex() === tour.steps.length - 1 : false;
    });

    readonly isFirstStep = computed(() => this.currentStepIndex() === 0);

    readonly progress = computed(() => {
        const tour = this.currentTour();
        if (!tour) return { current: 0, total: 0 };
        return { current: this.currentStepIndex() + 1, total: tour.steps.length };
    });

    startTour(tourId: string): boolean {
        const tour = TOURS[tourId];
        if (!tour) return false;

        this.currentTour.set(tour);
        this.currentStepIndex.set(0);
        this.isActive.set(true);
        return true;
    }

    startTourIfNotSeen(tourId: string): boolean {
        if (this.hasSeenTour(tourId)) return false;
        return this.startTour(tourId);
    }

    nextStep(): void {
        const tour = this.currentTour();
        if (!tour) return;

        if (this.currentStepIndex() < tour.steps.length - 1) {
            this.currentStepIndex.update((i) => i + 1);
        } else {
            this.endTour();
        }
    }

    previousStep(): void {
        if (this.currentStepIndex() > 0) {
            this.currentStepIndex.update((i) => i - 1);
        }
    }

    endTour(): void {
        const tour = this.currentTour();
        if (tour) {
            this.markTourAsSeen(tour.id);
        }
        this.currentTour.set(null);
        this.currentStepIndex.set(0);
        this.isActive.set(false);
    }

    skipTour(): void {
        this.endTour();
    }

    private hasSeenTour(tourId: string): boolean {
        const seen = this.getSeenTours();
        return seen.includes(tourId);
    }

    private markTourAsSeen(tourId: string): void {
        const seen = this.getSeenTours();
        if (!seen.includes(tourId)) {
            seen.push(tourId);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(seen));
        }
    }

    private getSeenTours(): string[] {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    resetAllTours(): void {
        localStorage.removeItem(STORAGE_KEY);
    }
}
