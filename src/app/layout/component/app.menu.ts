import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { TranslationService } from '../../core/services/translation.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `,
})
export class AppMenu {
    private translationService = inject(TranslationService);
    private authService = inject(AuthService);

    model: MenuItem[] = [];

    ngOnInit() {
        const items = [
            {
                label: this.translationService.translate('nav.gallery'),
                icon: 'pi pi-fw pi-star',
                routerLink: ['/professional/gallery'],
            },
            {
                label: this.translationService.translate('nav.myProdigies'),
                icon: 'pi pi-fw pi-id-card',
                routerLink: ['/professional/prodiges'],
            },
            {
                label: this.translationService.translate('nav.myVideos'),
                icon: 'pi pi-fw pi-video',
                routerLink: ['/professional/videos'],
            },
            {
                label: this.translationService.translate('nav.subscription'),
                icon: 'pi pi-fw pi-receipt',
                routerLink: ['/billing/subscription'],
            },
        ];

        // Add moderation only for moderators
        if (this.authService.isModerator()) {
            items.splice(3, 0, {
                label: this.translationService.translate('nav.moderation'),
                icon: 'pi pi-fw pi-check-circle',
                routerLink: ['/professional/moderation'],
            });
        }

        this.model = [
            {
                label: this.translationService.translate('nav.profesional'),
                items: items,
            },
        ];
    }
}
