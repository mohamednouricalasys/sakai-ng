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
     * Récupère la liste de toutes les vidéos
     */
    getVideos(): Observable<Video[]> {
        return this.http.get<Video[]>(`${this.apiUrl}/all`);
    }

    /**
     * Récupère la liste des vidéos par ID de prodige
     */
    getVideosByProdigeId(prodigeId: string): Observable<Video[]> {
        return this.http.get<Video[]>(`${this.apiUrl}/all/${prodigeId}`);
    }

    /**
     * Récupère une vidéo par son ID
     */
    getVideoById(id: string): Observable<Video> {
        return this.http.get<Video>(`${this.apiUrl}/${id}`);
    }

    /**
     * Récupère les vidéos de façon paginée
     */
    getVideosPaginated(request: GetVideosPaginatedRequest = {}): Observable<PaginatedList<Video>> {
        let params = new HttpParams();

        if (request.pageNumber) {
            params = params.set('pageNumber', request.pageNumber.toString());
        }
        if (request.pageSize) {
            params = params.set('pageSize', request.pageSize.toString());
        }

        return this.http.get<PaginatedList<Video>>(this.apiUrl, { params });
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
     * Obtient l'icône associée au statut de modération
     */
    getStatutModerationIcon(statut: StatutModeration): string {
        switch (statut) {
            case StatutModeration.EnAttente:
                return 'clock';
            case StatutModeration.Approuvee:
                return 'check-circle';
            case StatutModeration.Rejetee:
                return 'x-circle';
            default:
                return 'help-circle';
        }
    }

    /**
     * Vérifie si une vidéo peut être modifiée
     */
    canEditVideo(video: Video): boolean {
        return video.statutModeration === StatutModeration.EnAttente || video.statutModeration === StatutModeration.Rejetee;
    }

    /**
     * Vérifie si une vidéo peut être supprimée
     */
    canDeleteVideo(video: Video): boolean {
        // Logique métier pour déterminer si la suppression est autorisée
        return true; // À adapter selon vos règles métier
    }

    /**
     * Modère une vidéo (Approuvee ou rejette)
     */
    moderateVideo(id: string, statut: StatutModeration, commentaire?: string): Observable<Video> {
        const video: Partial<UpdateVideoRequest> = {
            statutModeration: statut,
            commentaireModeration: commentaire,
        };

        return this.http.patch<Video>(`${this.apiUrl}/${id}/moderate`, video);
    }

    /**
     * Signale une vidéo comme inappropriée
     */
    reportVideo(id: string, raison?: string): Observable<Video> {
        return this.moderateVideo(id, StatutModeration.Rejetee, raison);
    }

    /**
     * Filtre les vidéos par statut de modération
     */
    getVideosByModerationStatus(statut: StatutModeration): Observable<Video[]> {
        const params = new HttpParams().set('statutModeration', statut.toString());
        return this.http.get<Video[]>(`${this.apiUrl}/filter`, { params });
    }

    /**
     * Obtient les statistiques des vidéos par statut
     */
    getVideoStatistics(): Observable<{ [key in StatutModeration]: number }> {
        return this.http.get<{ [key in StatutModeration]: number }>(`${this.apiUrl}/statistics`);
    }

    /**
     * Recherche des vidéos par titre ou description
     */
    searchVideos(query: string, pageNumber: number = 1, pageSize: number = 10): Observable<PaginatedList<Video>> {
        let params = new HttpParams().set('query', query).set('pageNumber', pageNumber.toString()).set('pageSize', pageSize.toString());

        return this.http.get<PaginatedList<Video>>(`${this.apiUrl}/search`, { params });
    }

    /**
     * Upload d'un fichier vidéo
     */
    uploadVideoFile(file: File): Observable<{ fileItemId: string }> {
        const formData = new FormData();
        formData.append('file', file);

        return this.http.post<{ fileItemId: string }>(`${this.apiUrl}/upload`, formData);
    }

    /**
     * Obtient l'URL de prévisualisation d'une vidéo
     */
    getVideoPreviewUrl(fileItemId: string): string {
        return `${environment.apiUrl}/files/${fileItemId}/preview`;
    }

    /**
     * Obtient l'URL de téléchargement d'une vidéo
     */
    getVideoDownloadUrl(fileItemId: string): string {
        return `${environment.apiUrl}/files/${fileItemId}/download`;
    }
}
