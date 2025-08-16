import { Component, inject, OnInit, signal, ViewChild, Input, OnChanges, SimpleChanges, AfterViewInit, QueryList, ElementRef, ViewChildren, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService, SelectItem, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DataViewModule } from 'primeng/dataview';
import { TagModule } from 'primeng/tag';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TranslatePipe, TranslateParamsPipe } from '../../../../core/shared';
import { VideoService } from '../../../../core/services/video.service';
import { Video } from '../../../../core/interfaces/video.interface';
import { VideoStatus } from '../../../../core/enums/video-status.enum';
import { TranslationService } from '../../../../core/services/translation.service';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';

import videojs from 'video.js';

// Import Prodige-related services and interfaces
import { ProdigeService } from '../../../../core/services/prodige.service';
import { Prodige } from '../../../../core/interfaces/prodige.interface';
import { FluidModule } from 'primeng/fluid';
import { DividerModule } from 'primeng/divider';
import { Mp4UploaderComponent } from '../../../../core/shared/components/mp4-uploader/mp4-uploader.component';
import { FileItem } from '../../../../core/interfaces/file-Item.interface';

@Component({
    selector: 'app-prodige-video-crud',
    standalone: true,
    imports: [
        Mp4UploaderComponent,
        CommonModule,
        DividerModule,
        FormsModule,
        FileUploadModule,
        ButtonModule,
        DialogModule,
        InputTextModule,
        ToastModule,
        DataViewModule,
        TagModule,
        SelectModule,
        SelectButtonModule,
        ConfirmDialogModule,
        TranslatePipe,
        TranslateParamsPipe,
        FluidModule,
        TextareaModule,
        MessageModule,
        MessagesModule,
    ],
    templateUrl: './prodige-video-crud.component.html',
    providers: [MessageService, ConfirmationService],
    styles: `
        .video-container {
            width: 100%;
            position: relative;
            overflow: hidden;
            border-radius: 8px;
        }

        .video-container video {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .vjs-tech {
            object-fit: cover;
        }

        .upload-guidelines {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        }

        .guideline-item {
            display: flex;
            align-items: flex-start;
            gap: 0.5rem;
            margin-bottom: 0.75rem;
        }

        .guideline-item:last-child {
            margin-bottom: 0;
        }

        .guideline-icon {
            color: #dc3545;
            margin-top: 0.125rem;
            flex-shrink: 0;
        }

        .video-limit-warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 0.75rem;
            margin-bottom: 1rem;
        }
    `,
})
export class ProdigeVideoCrudComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChildren('videoElement') videoElements!: QueryList<ElementRef>;

    baseUploadCallBack: string;
    showVideo = true;
    showProdigeSidebar = true;

    // Maximum videos per prodigy
    readonly MAX_VIDEOS_PER_PRODIGY = 3;

    uploadedFiles: FileItem[] = [];
    videoDialog: boolean = false;
    videos = signal<Video[]>([]);
    video: Video = {};
    submitted: boolean = false;
    sortOptions!: SelectItem[];
    sortOrder!: number;
    sortField!: string;

    layout: 'list' | 'grid' = 'grid';
    layoutOptions = ['list', 'grid'];

    // New properties for prodige selection
    prodiges = signal<Prodige[]>([]);
    selectedProdige = signal<Prodige | null>(null);

    private videoPlayers = new Map<string, any>();
    public videoService = inject(VideoService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    public translationService = inject(TranslationService);
    public prodigeService = inject(ProdigeService);

    constructor(private cdr: ChangeDetectorRef) {
        this.baseUploadCallBack = this.videoService.getBaseUploadCallBack();
    }

    ngOnInit() {
        this.sortOptions = [
            { label: this.t('video.sort.title.down'), value: '!titre' },
            { label: this.t('video.sort.title.up'), value: 'titre' },
        ];

        // Load the list of prodiges from the service
        this.prodigeService.getProdigies().subscribe({
            next: (data) => {
                this.prodiges.set(data);
                if (data && data.length > 0) {
                    this.selectedProdige.set(data[0]);
                    this.loadVideos();
                }
            },
            error: () =>
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: this.t('shared.messages.dataLoadError'),
                }),
        });
    }

    onSortChange(event: any) {
        let value = event.value;

        if (value.indexOf('!') === 0) {
            this.sortOrder = -1;
            this.sortField = value.substring(1, value.length);
        } else {
            this.sortOrder = 1;
            this.sortField = value;
        }

        this.refreshVideo();
    }

    ngAfterViewInit(): void {
        this.videoElements.changes.subscribe(() => {
            this.initializeVideoPlayers();
        });
        this.initializeVideoPlayers();
        this.initVideos();
    }

    ngAfterViewChecked() {
        this.initVideos();
    }

    private initVideos() {
        this.cdr.detectChanges();
    }

    ngOnDestroy(): void {
        this.videoPlayers.forEach((player) => {
            if (!player.isDisposed()) {
                player.dispose();
            }
        });
        this.videoPlayers.clear();
    }

    private initializeVideoPlayers(): void {
        this.videoPlayers.forEach((player) => {
            if (!player.isDisposed()) {
                player.dispose();
            }
        });
        this.videoPlayers.clear();

        this.videoElements.forEach((el) => {
            const videoId = el.nativeElement.id;
            const options = {
                controls: true,
                autoplay: false,
                preload: 'metadata',
                responsive: true,
                fluid: true,
            };
            const player = videojs(el.nativeElement, options, () => {
                // Player is ready
            });
            this.videoPlayers.set(videoId, player);
        });
    }

    onProdigeChange(event: any) {
        this.selectedProdige.set(event.value);
        this.loadVideos();
    }

    protected t(key: string, params?: Record<string, any>): string {
        return this.translationService.translate(key, params);
    }

    /**
     * Check if the current prodigy has reached the maximum video limit
     */
    hasReachedVideoLimit(): boolean {
        return this.videos().length >= this.MAX_VIDEOS_PER_PRODIGY;
    }

    /**
     * Get remaining video slots for current prodigy
     */
    getRemainingVideoSlots(): number {
        return Math.max(0, this.MAX_VIDEOS_PER_PRODIGY - this.videos().length);
    }

    openNew() {
        if (this.hasReachedVideoLimit()) {
            this.messageService.add({
                severity: 'warn',
                summary: this.t('video.messages.limitReached'),
                detail: this.t('video.messages.limitReachedDetail', {
                    maxVideos: this.MAX_VIDEOS_PER_PRODIGY,
                    prodigyName: this.selectedProdige()?.nom,
                }),
                life: 5000,
            });
            return;
        }

        this.video = {
            prodigeId: this.selectedProdige()?.id,
            etat: VideoStatus.EnTraitement,
        };
        this.uploadedFiles = [];
        this.submitted = false;
        this.videoDialog = true;
    }

    editVideo(video: Video) {
        this.video = { ...video };
        this.uploadedFiles = [];
        this.videoDialog = true;
    }

    loadVideos() {
        const prodige = this.selectedProdige();
        if (!prodige || !prodige.id) {
            this.videos.set([]);
            return;
        }

        this.videoService.getVideosByProdigeId(prodige.id).subscribe({
            next: (data) => this.videos.set(data),
            error: () =>
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: this.t('shared.messages.dataLoadError'),
                }),
        });
    }

    /**
     * Handle file upload from Mp4UploaderComponent
     */
    onFileUploaded(fileItem: FileItem) {
        console.log('File uploaded:', fileItem);

        // Add to uploaded files array
        this.uploadedFiles.push(fileItem);

        // Set the video URL for preview (use the first uploaded file)
        if (this.uploadedFiles.length === 1) {
            this.video.url = fileItem.url;
        }

        this.messageService.add({
            severity: 'success',
            summary: this.t('uploader.messages.uploadComplete'),
            detail: this.t('uploader.messages.uploadSuccess', { fileName: fileItem.name }),
            life: 3000,
        });
    }

    /**
     * Handle file removal from Mp4UploaderComponent
     */
    onFileRemoved(fileId: string) {
        console.log('File removed:', fileId);

        // Remove from uploaded files array
        this.uploadedFiles = this.uploadedFiles.filter((file) => file.id !== fileId);

        // Update video URL if needed
        if (this.uploadedFiles.length > 0) {
            this.video.url = this.uploadedFiles[0].url;
        } else {
            this.video.url = undefined;
        }

        this.messageService.add({
            severity: 'info',
            summary: this.t('uploader.messages.fileRemoved'),
            detail: this.t('uploader.messages.fileRemovedSuccess'),
            life: 3000,
        });
    }

    saveVideo() {
        this.submitted = true;
        const prodige = this.selectedProdige();

        if (!prodige) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: this.t('video.messages.noProdigeSelected'),
            });
            return;
        }

        // Check if we have a title and either an uploaded file or manual URL
        if (!this.video.titre || (!this.uploadedFiles.length && !this.video.url)) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: this.t('video.messages.titleAndVideoRequired'),
            });
            return;
        }

        // For new videos, check the limit
        if (!this.video.id && this.hasReachedVideoLimit()) {
            this.messageService.add({
                severity: 'error',
                summary: this.t('video.messages.limitReached'),
                detail: this.t('video.messages.limitReachedDetail', {
                    maxVideos: this.MAX_VIDEOS_PER_PRODIGY,
                    prodigyName: prodige.nom,
                }),
            });
            return;
        }

        // Use uploaded file URL if available, otherwise use manual URL
        if (this.uploadedFiles.length > 0) {
            this.video.url = this.uploadedFiles[0].url;
        }

        this.video.prodigeId = prodige.id;

        if (this.video.id) {
            // Update existing video
            this.videoService.updateVideo('', this.video).subscribe({
                next: (updatedVideo) => {
                    this.videos.update((vids) => vids.map((v) => (v.id === updatedVideo.id ? updatedVideo : v)));
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: this.t('video.messages.videoUpdated'),
                    });
                    this.videoDialog = false;
                    this.video = {};
                    this.uploadedFiles = [];
                },
                error: () =>
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: this.t('shared.messages.saveError'),
                    }),
            });
        } else {
            // Create new video
            this.videoService.createVideo({ ...this.video, prodigeId: prodige.id! }).subscribe({
                next: (newVideo) => {
                    this.videos.update((vids) => [...vids, newVideo]);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: this.t('video.messages.videoCreated'),
                    });
                    this.videoDialog = false;
                    this.video = {};
                    this.uploadedFiles = [];
                },
                error: () =>
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: this.t('shared.messages.saveError'),
                    }),
            });
        }
    }

    hideDialog() {
        this.videoDialog = false;
        this.submitted = false;
        this.uploadedFiles = [];
        this.video = {};
    }

    deleteVideo(video: Video) {
        if (!video.id) return;

        this.confirmationService.confirm({
            message: this.t('video.messages.confirmDeleteVideo', { title: video.titre }),
            header: this.t('shared.common.confirmation'),
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.videoService.deleteVideo(video.id!).subscribe({
                    next: () => {
                        this.videos.update((vids) => vids.filter((v) => v.id !== video.id));
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: this.t('video.messages.videoDeleted'),
                        });
                        this.refreshVideo();
                    },
                    error: () =>
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: this.t('shared.messages.deleteError'),
                        }),
                });
            },
        });
    }

    refreshVideo() {
        this.cdr.detectChanges();
        this.showVideo = false;
        setTimeout(() => {
            this.showVideo = true;
        }, 0);
    }
}
