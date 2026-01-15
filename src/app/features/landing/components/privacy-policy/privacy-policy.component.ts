import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CompanyConfigService, CompanyConfig } from '../../../../core/services/company-config.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
    selector: 'app-privacy-policy',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './privacy-policy.component.html',
    styleUrls: ['./privacy-policy.component.scss'],
})
export class PrivacyPolicyComponent implements OnInit {
    private companyConfigService = inject(CompanyConfigService);
    private translationService = inject(TranslationService);

    config: CompanyConfig | null = null;

    ngOnInit(): void {
        this.companyConfigService.loadConfig().subscribe((config) => {
            this.config = config;
        });
    }

    protected t(key: string, params?: Record<string, any>): string {
        return this.translationService.translate(key, params);
    }

    get fullAddress(): string {
        return this.companyConfigService.getFullAddress();
    }

    get lastUpdated(): string {
        return this.companyConfigService.getFormattedLastUpdated();
    }
}
