import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
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
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { OverlayPanel } from 'primeng/overlaypanel';
import { MenuItem } from 'primeng/api';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator, LanguageSwitcherComponent, OverlayPanelModule, ButtonModule, SidebarModule],
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

    constructor(
        public layoutService: LayoutService,
        private keycloakService: KeycloakService,
        private userService: UserService,
    ) {}

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
}
