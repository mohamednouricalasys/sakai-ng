import { Component, inject, OnInit, signal, AfterViewInit, QueryList, ElementRef, ViewChildren, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
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
import { Video, CreateVideoRequest, UpdateVideoRequest } from '../../../../core/interfaces/video.interface';
import { StatutModeration } from '../../../../core/enums/statut-moderation.enum';
import { TranslationService } from '../../../../core/services/translation.service';
import { TextareaModule } from 'primeng/textarea';

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

        .loading-spinner {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 200px;
        }
    `,
})
export class ProdigeVideoCrudComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChildren('videoElement') videoElements!: QueryList<ElementRef>;

    statutModeration = StatutModeration; // Expose enum to template
    showVideo = true;
    loading = signal<boolean>(false);
    saving = signal<boolean>(false);

    // Maximum videos per prodigy
    readonly MAX_VIDEOS_PER_PRODIGY = 3;

    uploadedFile: FileItem | null = null;
    videoDialog: boolean = false;
    videos = signal<Video[]>([]);
    video: Partial<Video> = {};
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
    private translationService = inject(TranslationService);
    private prodigeService = inject(ProdigeService);

    constructor(private cdr: ChangeDetectorRef) {}

    ngOnInit() {
        this.sortOptions = [
            { label: this.t('video.sort.title.down'), value: '!titre' },
            { label: this.t('video.sort.title.up'), value: 'titre' },
        ];

        this.loadProdiges();
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

    private loadProdiges() {
        this.loading.set(true);
        this.prodigeService.getProdigies().subscribe({
            next: (data) => {
                this.prodiges.set(data);
                if (data && data.length > 0) {
                    this.selectedProdige.set(data[0]);
                    this.loadVideos();
                }
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Error loading prodiges:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: this.t('shared.common.error'),
                    detail: this.t('shared.messages.dataLoadError'),
                });
                this.loading.set(false);
            },
        });
    }

    onProdigeChange(event: any) {
        this.selectedProdige.set(event.value);
        this.loadVideos();
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

        const prodige = this.selectedProdige();
        if (!prodige) {
            this.messageService.add({
                severity: 'error',
                summary: this.t('shared.common.error'),
                detail: this.t('video.messages.noProdigeSelected'),
            });
            return;
        }

        this.uploadedFile = null;
        this.submitted = false;
        this.videoDialog = true;
    }

    editVideo(video: Video) {
        this.video = { ...video };
        this.uploadedFile = video.fileItem;
        this.videoDialog = true;
    }

    loadVideos() {
        const prodige = this.selectedProdige();
        if (!prodige || !prodige.id) {
            this.videos.set([]);
            return;
        }

        this.loading.set(true);
        this.videoService.getVideosByProdigeId(prodige.id).subscribe({
            next: (data) => {
                // Process video URLs for display
                const processedVideos = data.map((video) => ({
                    ...video,
                    url: this.videoService.getVideoPreviewUrl(video.fileItemId),
                }));
                this.videos.set(processedVideos);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Error loading videos:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: this.t('shared.common.error'),
                    detail: this.t('shared.messages.dataLoadError'),
                });
                this.loading.set(false);
            },
        });
    }

    /**
     * Handle file upload from Mp4UploaderComponent
     */
    onFileUploaded(fileItem: FileItem) {
        console.log('File uploaded:', fileItem);

        // Add to uploaded files array
        this.uploadedFile = fileItem;

        // Set the video URL for preview (use the first uploaded file)
        this.video.fileItem = fileItem;
        this.video.fileItemId = fileItem.id;
        this.video.uniqueFilename = fileItem.uniqueFilename;

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
        this.uploadedFile = null;

        this.video.fileItem = undefined;

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
                summary: this.t('shared.common.error'),
                detail: this.t('video.messages.noProdigeSelected'),
            });
            return;
        }

        // Validation
        if (!this.video.titre || (!this.video.fileItemId && !this.uploadedFile)) {
            this.messageService.add({
                severity: 'error',
                summary: this.t('shared.common.error'),
                detail: this.t('video.messages.titleAndVideoRequired'),
            });
            return;
        }

        if (!this.uploadedFile) {
            this.messageService.add({
                severity: 'error',
                summary: this.t('shared.common.error'),
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

        // Set fileItemId from uploaded files if available
        if (this.uploadedFile) {
            this.video.fileItemId = this.uploadedFile.id;
            this.video.uniqueFilename = this.uploadedFile.uniqueFilename;
        }

        this.saving.set(true);

        if (this.video.id) {
            // Update existing video
            const updateRequest: UpdateVideoRequest = {
                id: this.video.id,
                titre: this.video.titre!,
                description: this.video.description || '',
                uniqueFilename: this.video.uniqueFilename!,
            };

            this.videoService.updateVideo(this.video.id, updateRequest).subscribe({
                next: (updatedVideo) => {
                    // Add URL for display
                    const videoWithUrl = {
                        ...updatedVideo,
                        url: this.videoService.getVideoPreviewUrl(updatedVideo.fileItemId),
                    };

                    this.videos.update((vids) => vids.map((v) => (v.id === updatedVideo.id ? videoWithUrl : v)));
                    this.messageService.add({
                        severity: 'success',
                        summary: this.t('shared.common.success'),
                        detail: this.t('video.messages.videoUpdated'),
                    });
                    this.hideDialog();
                    this.saving.set(false);
                },
                error: (error) => {
                    console.error('Update video error:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: this.t('shared.common.error'),
                        detail: this.t('shared.messages.saveError'),
                    });
                    this.saving.set(false);
                },
            });
        } else {
            // Create new video
            const createRequest: CreateVideoRequest = {
                titre: this.video.titre!,
                description: this.video.description || '',
                uniqueFilename: this.video.uniqueFilename!,
                prodigeId: prodige.id!,
                commentaireModeration: this.video.commentaireModeration,
            };

            this.videoService.createVideo(createRequest).subscribe({
                next: (newVideo) => {
                    // Add URL for display
                    const videoWithUrl = {
                        ...newVideo,
                        url: this.videoService.getVideoPreviewUrl(newVideo.fileItemId),
                    };

                    this.videos.update((vids) => [...vids, videoWithUrl]);
                    this.messageService.add({
                        severity: 'success',
                        summary: this.t('shared.common.success'),
                        detail: this.t('video.messages.videoCreated'),
                    });
                    this.hideDialog();
                    this.saving.set(false);
                },
                error: (error) => {
                    console.error('Create video error:', error);
                    console.error('Error details:', {
                        status: error.status,
                        statusText: error.statusText,
                        url: error.url,
                        message: error.message,
                    });

                    // Check if it's a network error
                    if (error.status === 0) {
                        console.error('Network error - check API URL and server connectivity');
                    }

                    this.messageService.add({
                        severity: 'error',
                        summary: this.t('shared.common.error'),
                        detail: this.t('shared.messages.saveError'),
                    });
                    this.saving.set(false);
                },
            });
        }
    }

    hideDialog() {
        this.videoDialog = false;
        this.submitted = false;
        this.uploadedFile = null;
        this.video = {};
        this.saving.set(false);
        this.loadVideos();
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
                            summary: this.t('shared.common.success'),
                            detail: this.t('video.messages.videoDeleted'),
                        });
                        this.refreshVideo();
                    },
                    error: (error) => {
                        console.error('Delete video error:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: this.t('shared.common.error'),
                            detail: this.t('shared.messages.deleteError'),
                        });
                    },
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

    // Helper methods for UI display
    getVideoStatusLabel(statut: StatutModeration): string {
        return this.videoService.getStatutModerationLabel(statut);
    }

    getVideoStatusSeverity(statut: StatutModeration): string {
        const colorMap = {
            warning: 'warning',
            success: 'success',
            danger: 'danger',
            secondary: 'secondary',
        };
        const colorKey = this.videoService.getStatutModerationColor(statut) as keyof typeof colorMap;
        return colorMap[colorKey] || 'secondary';
    }

    // Additional helper methods for better UX
    canModerateVideo(video: Video): boolean {
        return this.videoService.canEditVideo(video);
    }
}
