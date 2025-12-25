import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../core/shared';

@Component({
    selector: 'features-widget',
    standalone: true,
    imports: [CommonModule, TranslatePipe],
    templateUrl: './featureswidget.component.html',
    styleUrls: ['./featureswidget.component.scss'],
})
export class FeaturesWidgetComponent {}
