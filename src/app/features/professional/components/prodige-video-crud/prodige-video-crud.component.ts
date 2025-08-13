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

import videojs from 'video.js';

// Import Prodige-related services and interfaces
import { ProdigeService } from '../../../../core/services/prodige.service';
import { Prodige } from '../../../../core/interfaces/prodige.interface';
import { FluidModule } from 'primeng/fluid';
import { DividerModule } from 'primeng/divider';
import { Mp4UploaderComponent } from '../../../../core/shared/components/mp4-uploader/mp4-uploader.component';

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
    ],
    templateUrl: './prodige-video-crud.component.html',
    providers: [MessageService, ConfirmationService],
    styles: `
        .video-container {
            width: 100%;
            position: relative;
            overflow: hidden;
            border-radius: 8px; /* Optional: rounded corners */
        }

        .video-container video {
            width: 100%;
            height: 100%;
            object-fit: cover; /* or 'contain' depending on preference */
        }

        .vjs-tech {
            object-fit: cover;
        }
    `,
})
export class ProdigeVideoCrudComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChildren('videoElement') videoElements!: QueryList<ElementRef>;

    baseUploadCallBack: string;
    showVideo = true;
    showProdigeSidebar = true;

    uploadedFile: File | null = null;

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
    public prodigeService = inject(ProdigeService); // Inject ProdigeService

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
                    this.selectedProdige.set(data[0]); // Select the first prodige by default
                    this.loadVideos(); // Load videos for the default selection
                }
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: this.t('shared.messages.dataLoadError') }),
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
        // Update your data
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

    // Method to handle prodige selection changes
    onProdigeChange(event: any) {
        this.selectedProdige.set(event.value);
        this.loadVideos();
    }

    // ... (onSortChange and other existing methods)

    protected t(key: string, params?: Record<string, any>): string {
        return this.translationService.translate(key, params);
    }

    openNew() {
        this.video = { prodigeId: this.selectedProdige()?.id, etat: VideoStatus.EnTraitement };
        this.submitted = false;
        this.videoDialog = true;
    }

    editVideo(video: Video) {
        this.video = { ...video };
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
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: this.t('shared.messages.dataLoadError') }),
        });
    }

    onUpload(event: any) {
        if (event.files && event.files.length > 0) {
            this.uploadedFile = event.files[0];
            const fileUrl = this.uploadedFile ? URL.createObjectURL(this.uploadedFile) : '';
            this.video.url = fileUrl; // Set the video URL for preview
            this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File uploaded successfully' });
        }
    }

    saveVideo() {
        this.submitted = true;
        const prodige = this.selectedProdige();
        if (!prodige) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: this.translationService.translate('video.messages.noProdigeSelected') });
            return;
        }

        // Use the uploaded file's URL or the hand-written URL
        if (this.video.titre && this.video.url) {
            this.video.prodigeId = prodige.id;
            if (this.video.id) {
                // ... (update logic)
            } else {
                this.videoService.createVideo({ ...this.video, prodigeId: prodige.id! }).subscribe({
                    next: (newVideo) => {
                        this.videos.update((vids) => [...vids, newVideo]);
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: this.translationService.translate('video.messages.videoCreated') });
                        this.videoDialog = false;
                        this.video = {};
                    },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: this.translationService.translate('shared.messages.saveError') }),
                });
            }
        }
    }

    hideDialog() {
        this.videoDialog = false;
        this.submitted = false;
    }

    deleteVideo(video: Video) {
        if (!video.id) return;

        this.confirmationService.confirm({
            message: this.translationService.translate('video.messages.confirmDeleteVideo', { title: video.titre }),
            header: this.translationService.translate('shared.common.confirmation'),
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.videoService.deleteVideo(video.id!).subscribe({
                    next: () => {
                        this.videos.update((vids) => vids.filter((v) => v.id !== video.id));
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: this.translationService.translate('video.messages.videoDeleted') });
                        this.refreshVideo();
                    },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: this.translationService.translate('shared.messages.deleteError') }),
                });
            },
        });
    }

    refreshVideo() {
        this.cdr.detectChanges(); // Force change detection
        this.showVideo = false;
        setTimeout(() => {
            this.showVideo = true;
        }, 0);
    }

    onFileUploaded(file: any) {
        console.log('File uploaded:', file);
    }

    onFileRemoved(fileId: string) {
        console.log('File removed:', fileId);
    }
}
