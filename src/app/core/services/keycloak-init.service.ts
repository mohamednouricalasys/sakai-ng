import { Injectable, inject, signal } from '@angular/core';
import { KeycloakService, KeycloakEventTypeLegacy } from 'keycloak-angular';
import { UserService } from './user.service';
import { environment } from '../../../environments/environment';
import { Capacitor } from '@capacitor/core';

@Injectable({ providedIn: 'root' })
export class KeycloakInitService {
    private keycloak = inject(KeycloakService);
    private userService = inject(UserService);

    private _ready = signal(false);
    private _authenticated = signal(false);
    private _initPromise: Promise<boolean> | null = null;

    /** Synchronous check — true once Keycloak init has completed */
    readonly ready = this._ready.asReadonly();

    /** Synchronous check — true if user is authenticated (only meaningful after ready) */
    readonly authenticated = this._authenticated.asReadonly();

    /**
     * Start Keycloak initialization. Safe to call multiple times —
     * subsequent calls return the same promise.
     */
    init(): Promise<boolean> {
        if (this._initPromise) {
            return this._initPromise;
        }

        this._initPromise = this.doInit();
        return this._initPromise;
    }

    /**
     * Returns a promise that resolves when Keycloak is ready.
     * If init() hasn't been called yet, calls it.
     */
    whenReady(): Promise<boolean> {
        return this.init();
    }

    private async doInit(): Promise<boolean> {
        const isNative = Capacitor.isNativePlatform();
        try {
            const authenticated = await this.keycloak.init({
                config: {
                    url: environment.keycloakUrl,
                    realm: environment.keycloakRealm,
                    clientId: environment.keycloakclientId,
                },
                initOptions: {
                    onLoad: isNative ? undefined : 'check-sso',
                    silentCheckSsoRedirectUri: isNative ? undefined : window.location.origin + '/assets/silent-check-sso.html',
                    checkLoginIframe: !isNative,
                    checkLoginIframeInterval: 30,
                },
                shouldAddToken: (request) => {
                    const { url } = request;
                    const excludedUrls = ['/assets', '/public'];
                    return !excludedUrls.some((excluded) => url.includes(excluded));
                },
                shouldUpdateToken: () => true,
            });

            this._authenticated.set(authenticated);

            if (authenticated) {
                await this.userService.loadUserProfile();

                setInterval(async () => {
                    try {
                        await this.keycloak.updateToken(60);
                    } catch {
                        this.keycloak.login();
                    }
                }, 30000);
            }

            this.keycloak.keycloakEvents$.subscribe({
                next: (event) => {
                    if (event.type === KeycloakEventTypeLegacy.OnAuthLogout || event.type === KeycloakEventTypeLegacy.OnTokenExpired) {
                        this.keycloak.login();
                    }
                },
            });
        } catch (error) {
            console.error('Keycloak initialization failed', error);
        }

        this._ready.set(true);
        return this._authenticated();
    }
}
