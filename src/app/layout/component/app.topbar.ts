import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { LanguageSwitcherComponent } from '../../core/shared';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { UserService } from '../../core/services/user.service';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { MenuItem } from 'primeng/api';
import { SubscriptionService } from '../../core/services/subscription.service';
import { TranslatePipe } from '../../core/shared';
import { TranslationService } from '../../core/services/translation.service';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator, LanguageSwitcherComponent, OverlayPanelModule, ButtonModule, SidebarModule, TranslatePipe, DialogModule, ToastModule, ProgressSpinnerModule],
    templateUrl: './app.topbar.html',
})
export class AppTopbar implements OnInit {
    items!: MenuItem[];

    profile?: KeycloakProfile;
    profileDisplayName?: string;

    // overlay reference for desktop popup
    @ViewChild('profileOverlay') profileOverlay?: OverlayPanel;

    // New responsive state
    isMobile = false;
    showMobileProfile = false;

    // Delete account dialog state
    showDeleteConfirmDialog = false;
    isDeletingAccount = false;

    constructor(
        public layoutService: LayoutService,
        private keycloakService: KeycloakService,
        private userService: UserService,
        private subscriptionService: SubscriptionService,
        private translationService: TranslationService,
    ) {}

    protected t(key: string, params?: Record<string, any>): string {
        return this.translationService.translate(key, params);
    }

    async ngOnInit(): Promise<void> {
        this.updateIsMobile();
        try {
            await this.userService.loadUserProfile();
            this.profile = this.userService.getProfile();
            this.profileDisplayName = this.getFullName(this.profile);
            // no menu model needed for overlay panel
        } catch (err) {
            console.error('Failed to load user profile in topbar', err);
        }
    }

    // listen to window resize to update mobile/desktop UI
    @HostListener('window:resize')
    updateIsMobile(): void {
        this.isMobile = window.innerWidth <= 768; // adjust breakpoint as needed
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    getFullName(profile?: KeycloakProfile): string {
        const parts = [profile?.firstName, profile?.lastName].filter(Boolean);
        return parts.length ? parts.join(' ') : (profile?.username ?? '');
    }

    async logout(): Promise<void> {
        try {
            await this.keycloakService.logout(window.location.origin);
        } catch (err) {
            console.error('Logout failed', err);
        }
    }

    // toggles mobile sidebar
    toggleMobileProfile(): void {
        this.showMobileProfile = !this.showMobileProfile;
    }

    // toggle desktop overlay panel
    toggleDesktopProfile(event: Event): void {
        this.profileOverlay?.toggle(event);
    }

    editProfile(): void {
        this.keycloakService.getKeycloakInstance().accountManagement();
    }

    // Show delete confirmation dialog
    showDeleteAccountDialog(): void {
        this.showDeleteConfirmDialog = true;
    }

    // Cancel delete account
    cancelDeleteAccount(): void {
        this.showDeleteConfirmDialog = false;
    }

    // Confirm and execute delete account
    async confirmDeleteAccount(): Promise<void> {
        this.showDeleteConfirmDialog = false;
        this.isDeletingAccount = true;

        try {
            await lastValueFrom(this.userService.removeCurrentUser());

            // Show success alert
            alert(this.t('topbar.profile.deleteSuccessMessage'));

            // Only logout if deletion was successful
            setTimeout(async () => {
                await this.logout();
            }, 1500);
        } catch (err) {
            console.error('Failed to remove account', err);
            this.isDeletingAccount = false;

            // Show error alert
            alert(this.t('topbar.profile.deleteErrorMessage'));
        }
    }
}
