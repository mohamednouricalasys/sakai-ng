import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Video } from '../interfaces/video.interface';
import { VideoStatus } from '../enums/video-status.enum';
import { v4 as uuidv4 } from 'uuid';
import { TranslationService } from './translation.service';

@Injectable({
    providedIn: 'root',
})
export class VideoService {
    private translationService = inject(TranslationService);

    // Updated mock data with MP4 URLs
    private videos: Video[] = [
        {
            id: '1',
            prodigeId: '01988a47-92c0-7769-aba7-91f2799ee100',
            titre: 'Football Skills',
            description: 'A highlight reel of a young football player demonstrating various skills.',
            url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            etat: VideoStatus.Approuve,
            dateCreation: new Date(),
        },
        {
            id: '2',
            prodigeId: '01988a47-92c0-7769-aba7-91f2799ee100',
            titre: 'Dribbling Drills',
            description: 'Training footage of dribbling exercises.',
            url: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4',
            etat: VideoStatus.EnInspection,
            dateCreation: new Date(),
        },
        {
            id: '3',
            prodigeId: '01988a47-92c0-7769-aba7-91f2799ee100',
            titre: 'Tennis Match Point',
            description: 'A decisive point from a junior tennis tournament.',
            url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            etat: VideoStatus.Approuve,
            dateCreation: new Date(),
        },
        {
            id: '4',
            prodigeId: '01988a47-92c0-7769-aba7-91f2799ee100',
            titre: 'Basketball Training',
            description: 'A young prodigy performing different basketball drills.',
            url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            etat: VideoStatus.EnTraitement,
            dateCreation: new Date(),
        },
    ];

    constructor() {}

    getVideosByProdigeId(prodigeId: string): Observable<Video[]> {
        const prodigeVideos = this.videos.filter((v) => v.prodigeId === prodigeId);
        return of(prodigeVideos);
    }

    getVideoById(id: string): Observable<Video | undefined> {
        return of(this.videos.find((v) => v.id === id));
    }

    createVideo(video: Video): Observable<Video> {
        const newVideo = { ...video, id: uuidv4(), dateCreation: new Date() };
        this.videos.push(newVideo);
        return of(newVideo);
    }

    updateVideo(id: string, video: Video): Observable<Video> {
        const index = this.videos.findIndex((v) => v.id === id);
        if (index > -1) {
            this.videos[index] = { ...video, id, dateModification: new Date() };
        }
        return of(this.videos[index]);
    }

    deleteVideo(id: string): Observable<void> {
        this.videos = this.videos.filter((v) => v.id !== id);
        return of(undefined);
    }

    getVideoStatusLabel(status: VideoStatus): string {
        const translationKey = `video.status.${status}`;
        return this.translationService.translate(translationKey);
    }

    getVideoStatusOptions() {
        return Object.values(VideoStatus).map((status) => ({
            label: this.getVideoStatusLabel(status),
            value: status,
        }));
    }

    getVideoStatusSeverity(status: VideoStatus): string {
        switch (status) {
            case VideoStatus.Approuve:
                return 'success';
            case VideoStatus.EnInspection:
                return 'warn';
            case VideoStatus.Rejete:
                return 'danger';
            default:
                return 'info';
        }
    }
}
