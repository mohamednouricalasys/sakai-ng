import { Injectable, signal } from '@angular/core';

export interface CookiePreferences {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
}

const COOKIE_CONSENT_KEY = 'cookie_consent';
const COOKIE_PREFERENCES_KEY = 'cookie_preferences';

@Injectable({ providedIn: 'root' })
export class CookieConsentService {
    private _consentGiven = signal<boolean>(false);
    private _preferences = signal<CookiePreferences>({
        necessary: true,
        analytics: false,
        marketing: false,
    });
    private _showBanner = signal<boolean>(false);

    readonly consentGiven = this._consentGiven.asReadonly();
    readonly preferences = this._preferences.asReadonly();
    readonly showBanner = this._showBanner.asReadonly();

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
        const preferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);

        if (consent === 'true' && preferences) {
            this._consentGiven.set(true);
            this._preferences.set(JSON.parse(preferences));
            this._showBanner.set(false);
        } else {
            this._showBanner.set(true);
        }
    }

    acceptAll(): void {
        const allAccepted: CookiePreferences = {
            necessary: true,
            analytics: true,
            marketing: true,
        };
        this.savePreferences(allAccepted);
    }

    rejectAll(): void {
        const onlyNecessary: CookiePreferences = {
            necessary: true,
            analytics: false,
            marketing: false,
        };
        this.savePreferences(onlyNecessary);
    }

    savePreferences(preferences: CookiePreferences): void {
        preferences.necessary = true;
        this._preferences.set(preferences);
        this._consentGiven.set(true);
        this._showBanner.set(false);

        localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
        localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
    }

    resetConsent(): void {
        localStorage.removeItem(COOKIE_CONSENT_KEY);
        localStorage.removeItem(COOKIE_PREFERENCES_KEY);
        this._consentGiven.set(false);
        this._preferences.set({
            necessary: true,
            analytics: false,
            marketing: false,
        });
        this._showBanner.set(true);
    }

    hasAnalyticsConsent(): boolean {
        return this._consentGiven() && this._preferences().analytics;
    }

    hasMarketingConsent(): boolean {
        return this._consentGiven() && this._preferences().marketing;
    }
}
