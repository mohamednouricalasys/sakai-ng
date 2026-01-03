import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface CompanyAddress {
    street: string;
    postalCode: string;
    city: string;
    country: string;
}

export interface HostingProvider {
    name: string;
    address: string;
}

export interface CompanyConfig {
    companyName: string;
    legalName: string;
    address: CompanyAddress;
    email: string;
    phone: string;
    siret: string;
    rcs: string;
    tvaNumber: string;
    legalRepresentative: string;
    legalRepresentativeTitle: string;
    capitalSocial: string;
    hostingProvider: HostingProvider;
    dpoEmail: string;
    website: string;
    lastUpdated: string;
}

@Injectable({
    providedIn: 'root',
})
export class CompanyConfigService {
    private configSubject = new BehaviorSubject<CompanyConfig | null>(null);
    public config$ = this.configSubject.asObservable();
    private loaded = false;

    constructor(private http: HttpClient) {}

    loadConfig(): Observable<CompanyConfig> {
        return this.http.get<CompanyConfig>('/config/company.json').pipe(
            tap((config) => {
                this.configSubject.next(config);
                this.loaded = true;
            }),
        );
    }

    get config(): CompanyConfig | null {
        return this.configSubject.value;
    }

    get isLoaded(): boolean {
        return this.loaded;
    }

    getFullAddress(): string {
        const config = this.config;
        if (!config) return '';
        return `${config.address.street}, ${config.address.postalCode} ${config.address.city}, ${config.address.country}`;
    }

    getFormattedLastUpdated(): string {
        const config = this.config;
        if (!config) return '';
        const date = new Date(config.lastUpdated);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }
}
