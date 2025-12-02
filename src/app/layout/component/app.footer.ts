import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        Caviar Scout by
        <a href="https://caviarscout.com" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">Caviar Scout</a>
    </div>`,
})
export class AppFooter {}
