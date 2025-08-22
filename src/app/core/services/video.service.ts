import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Video, CreateVideoRequest, UpdateVideoRequest, PaginatedList, GetVideosPaginatedRequest } from '../interfaces/video.interface';
import { environment } from '../../../environments/environment';
import { KeycloakService } from 'keycloak-angular';
import { TranslationService } from './translation.service';
import { StatutModeration } from '../enums/statut-moderation.enum';

@Injectable({
    providedIn: 'root',
})
export class VideoService {
    private apiUrl;

    private translationService = inject(TranslationService);

    constructor(
        private http: HttpClient,
        private keycloakService: KeycloakService,
    ) {
        this.apiUrl = environment.apiUrl + '/videos';
    }

    /**
     * Récupère la liste des vidéos par ID de prodige
     */
    getVideosByProdigeId(prodigeId: string): Observable<Video[]> {
        return this.http.get<Video[]>(`${this.apiUrl}/all/${prodigeId}`);
    }

    /**
     * Crée une nouvelle vidéo
     */
    createVideo(video: CreateVideoRequest): Observable<Video> {
        return this.http.post<Video>(this.apiUrl, video);
    }

    /**
     * Met à jour une vidéo existante
     */
    updateVideo(id: string, video: UpdateVideoRequest): Observable<Video> {
        return this.http.put<Video>(`${this.apiUrl}/${id}`, video);
    }

    /**
     * Supprime une vidéo
     */
    deleteVideo(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
    /**
     * Obtient les options de statut de modération pour les sélecteurs
     */
    getStatutModerationOptions() {
        return Object.keys(StatutModeration)
            .filter((key) => isNaN(Number(key)))
            .map((key) => ({
                label: this.getStatutModerationLabel(StatutModeration[key as keyof typeof StatutModeration]),
                value: StatutModeration[key as keyof typeof StatutModeration],
            }));
    }
    /**
     * Obtient le libellé localisé pour un statut de modération
     */
    getStatutModerationLabel(statut: StatutModeration): string {
        switch (statut) {
            case StatutModeration.EnAttente:
                return this.translationService.translate('video.moderation.enAttente');
            case StatutModeration.Approuvee:
                return this.translationService.translate('video.moderation.Approuvee');
            case StatutModeration.Rejetee:
                return this.translationService.translate('video.moderation.rejete');
            default:
                return this.translationService.translate('video.moderation.unknown');
        }
    }

    /**
     * Obtient la couleur CSS associée au statut de modération
     */
    getStatutModerationColor(statut: StatutModeration): string {
        switch (statut) {
            case StatutModeration.EnAttente:
                return 'warning';
            case StatutModeration.Approuvee:
                return 'success';
            case StatutModeration.Rejetee:
                return 'danger';
            default:
                return 'secondary';
        }
    }

    /**
     * Vérifie si une vidéo peut être modifiée
     */
    canEditVideo(video: Video): boolean {
        return video.statutModeration === StatutModeration.EnAttente || video.statutModeration === StatutModeration.Rejetee;
    }

    /**
     * Obtient l'URL de prévisualisation d'une vidéo
     */
    getVideoPreviewUrl(fileItemId: string): string {
        return `${environment.apiUrl}/files/${fileItemId}/preview`;
    }
}
