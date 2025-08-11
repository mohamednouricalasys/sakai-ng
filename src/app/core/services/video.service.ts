import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Video } from '../interfaces/video.interface';
import { VideoStatus } from '../enums/video-status.enum';
import { v4 as uuidv4 } from 'uuid';
import { TranslationService } from './translation.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class VideoService {
    private apiUrl;

    private translationService = inject(TranslationService);

    // Updated mock data with MP4 URLs
    private videos: Video[] = [
        {
            id: '1',
            prodigeId: '0198907b-e20c-7b04-a084-4a9a189a3554',
            titre: this.translationService.translate('video.mock.title.footballSkills'),
            description: this.translationService.translate('video.mock.description.footballSkills'),
            url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            etat: VideoStatus.Approuve,
            dateCreation: new Date(),
        },
        {
            id: '2',
            prodigeId: '0198907b-e20c-7b04-a084-4a9a189a3554',
            titre: this.translationService.translate('video.mock.title.dribblingDrills'),
            description: this.translationService.translate('video.mock.description.dribblingDrills'),
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
            etat: VideoStatus.EnInspection,
            dateCreation: new Date(),
        },
        {
            id: '3',
            prodigeId: '0198907b-e20c-7b04-a084-4a9a189a3554',
            titre: this.translationService.translate('video.mock.title.tennisMatchPoint'),
            description: this.translationService.translate('video.mock.description.tennisMatchPoint'),
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
            etat: VideoStatus.Approuve,
            dateCreation: new Date(),
        },
        {
            id: '4',
            prodigeId: '0198907d-72e9-7d25-9a68-5ee1bb4021d5',
            titre: this.translationService.translate('video.mock.title.basketballTraining'),
            description: this.translationService.translate('video.mock.description.basketballTraining'),
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            etat: VideoStatus.EnTraitement,
            dateCreation: new Date(),
        },
    ];

    constructor(private http: HttpClient) {
        this.apiUrl = environment.apiUrl + '/videos'; // Adjust URL as needed
    }

    getBaseUploadCallBack(): string {
        return this.apiUrl + '/UploadCallBack';
    }

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
