import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ImpersonationState, ImpersonatedUser, AdminUser } from '../interfaces/admin.interface';

const IMPERSONATION_STORAGE_KEY = 'caviar_view_as';

@Injectable({ providedIn: 'root' })
export class ImpersonationService {
    private readonly router = inject(Router);

    private state = signal<ImpersonationState>({
        isImpersonating: false,
    });

    readonly isImpersonating = computed(() => this.state().isImpersonating);
    readonly impersonatedUser = computed(() => this.state().impersonatedUser);
    readonly viewAsUserId = computed(() => this.state().impersonatedUser?.id);

    constructor() {
        this.loadState();
    }

    private loadState(): void {
        const stored = sessionStorage.getItem(IMPERSONATION_STORAGE_KEY);
        if (stored) {
            try {
                const state = JSON.parse(stored) as ImpersonationState;
                this.state.set(state);
            } catch {
                sessionStorage.removeItem(IMPERSONATION_STORAGE_KEY);
            }
        }
    }

    private saveState(): void {
        sessionStorage.setItem(IMPERSONATION_STORAGE_KEY, JSON.stringify(this.state()));
    }

    private clearState(): void {
        sessionStorage.removeItem(IMPERSONATION_STORAGE_KEY);
        this.state.set({ isImpersonating: false });
    }

    /**
     * Start viewing as another user (View As mode)
     * The admin stays logged in but views the target user's data
     */
    async startViewAs(user: AdminUser): Promise<void> {
        const impersonatedUser: ImpersonatedUser = {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            roles: user.roles,
        };

        this.state.set({
            isImpersonating: true,
            impersonatedUser: impersonatedUser,
        });
        this.saveState();

        // Navigate to the prodiges page to see the user's data
        await this.router.navigate(['/professional/prodiges']);
    }

    /**
     * Stop viewing as another user
     */
    async stopViewAs(): Promise<void> {
        this.clearState();
        await this.router.navigate(['/professional/admin-users']);
    }

    getImpersonatedUserDisplayName(): string {
        const user = this.impersonatedUser();
        if (!user) return '';
        return user.fullName || `${user.firstName} ${user.lastName}`.trim() || user.username;
    }
}
