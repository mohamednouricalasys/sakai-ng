import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Video, CreateVideoRequest, UpdateVideoRequest, PaginatedList, GetVideosPaginatedRequest, ModerateVideoRequest } from '../interfaces/video.interface';
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
     * Récupère les vidéos en attente de modération avec pagination
     */
    getPendingVideos(params?: GetVideosPaginatedRequest): Observable<PaginatedList<Video>> {
        let httpParams = new HttpParams();

        if (params) {
            if (params.page) httpParams = httpParams.set('page', params.page.toString());
            if (params.size) httpParams = httpParams.set('size', params.size.toString());
            if (params.sortField) httpParams = httpParams.set('sortField', params.sortField);
            if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder.toString());
            if (params.search) httpParams = httpParams.set('search', params.search);
        }

        return this.http.get<PaginatedList<Video>>(`${this.apiUrl}/pending`, { params: httpParams });
    }

    /**
     * Récupère toutes les vidéos avec pagination (admin)
     */
    getAllVideosPaginated(params?: GetVideosPaginatedRequest): Observable<PaginatedList<Video>> {
        let httpParams = new HttpParams();

        if (params) {
            if (params.page) httpParams = httpParams.set('page', params.page.toString());
            if (params.size) httpParams = httpParams.set('size', params.size.toString());
            if (params.sortField) httpParams = httpParams.set('sortField', params.sortField);
            if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder.toString());
            if (params.search) httpParams = httpParams.set('search', params.search);
            if (params.status) httpParams = httpParams.set('status', params.status.toString());
        }

        return this.http.get<PaginatedList<Video>>(`${this.apiUrl}`, { params: httpParams });
    }

    getApprouvedVideosPaginated(request: GetVideosPaginatedRequest): Observable<PaginatedList<Video>> {
        let params = new HttpParams();

        if (request.page) params = params.set('page', request.page.toString());
        if (request.size) params = params.set('size', request.size.toString());
        if (request.sortField) params = params.set('sortField', request.sortField);
        if (request.sortOrder) params = params.set('sortOrder', request.sortOrder.toString());
        if (request.search) params = params.set('search', request.search);
        if (request.tag !== undefined) params = params.set('tag', request.tag.toString());
        if (request.sport !== undefined) params = params.set('sport', request.sport.toString());
        if (request.genre !== undefined) params = params.set('genre', request.genre.toString());

        return this.http.get<PaginatedList<Video>>(`${this.apiUrl}/approuved`, { params });
    }

    /**
     * Récupère une vidéo par son ID
     */
    getVideoById(id: string): Observable<Video> {
        return this.http.get<Video>(`${this.apiUrl}/${id}`);
    }

    /**
     * Modère une vidéo (approuver/rejeter)
     */
    moderateVideo(id: string, request: ModerateVideoRequest): Observable<Video> {
        return this.http.put<Video>(`${this.apiUrl}/${id}/moderate`, request);
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
                return this.translationService.translate('video.moderation.approuvee');
            case StatutModeration.Rejetee:
                return this.translationService.translate('video.moderation.rejetee');
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

    /**
     * Obtient l'URL complète d'une vidéo
     */
    getVideoUrl(fileItemId: string): string {
        return `${environment.apiUrl}/files/${fileItemId}`;
    }
}
