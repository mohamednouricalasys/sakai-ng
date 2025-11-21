import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'hero-widget',
    imports: [ButtonModule, RippleModule],
    templateUrl: './herowidget.component.html',
    styleUrls: ['./herowidget.component.scss'],
})
export class HeroWidgetComponent {}
