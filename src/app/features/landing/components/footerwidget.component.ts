import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'footer-widget',
    imports: [RouterModule],
    standalone: true,
    templateUrl: './footerwidget.component.html',
    styleUrls: ['./footerwidget.component.scss'],
})
export class FooterWidgetComponent {
    constructor(public router: Router) {}
}
