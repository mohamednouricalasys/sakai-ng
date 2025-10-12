import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { TranslationService } from '../../core/services/translation.service';

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

    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: this.translationService.translate('nav.profesional'),
                items: [
                    { label: 'Gellery', icon: 'pi pi-fw pi-star', routerLink: ['/professional/gellery'] },
                    { label: 'Mes prodiges', icon: 'pi pi-fw pi-id-card', routerLink: ['/professional/prodiges'] },
                    { label: 'Mes videos', icon: 'pi pi-fw pi-video', routerLink: ['/professional/videos'] },
                    { label: 'Moderation', icon: 'pi pi-fw pi-verified', routerLink: ['/professional/moderation'] },

                    { label: 'subscription', icon: 'pi pi-fw pi-verified', routerLink: ['/billing/subscription'] },
                ],
            },
        ];
    }
}
