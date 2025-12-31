import { Component, inject, OnInit, signal, OnDestroy, AfterViewInit, QueryList, ElementRef, ViewChildren, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService, SelectItem, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DataViewModule, DataViewPageEvent } from 'primeng/dataview';
import { TagModule } from 'primeng/tag';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TextareaModule } from 'primeng/textarea';
import { BadgeModule } from 'primeng/badge';
import { TranslatePipe, TranslateParamsPipe } from '../../../../core/shared';
import { VideoService } from '../../../../core/services/video.service';
import { Video, GetVideosPaginatedRequest, ModerateVideoRequest } from '../../../../core/interfaces/video.interface';
import { StatutModeration } from '../../../../core/enums/statut-moderation.enum';
import { TranslationService } from '../../../../core/services/translation.service';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import videojs from 'video.js';

@Component({
    selector: 'app-admin-video-moderation',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, DialogModule, InputTextModule, ToastModule, DataViewModule, TagModule, SelectModule, SelectButtonModule, ConfirmDialogModule, TextareaModule, BadgeModule, TranslatePipe, TranslateParamsPipe],
    templateUrl: './admin-video-moderation.component.html',
    providers: [MessageService, ConfirmationService],
    styleUrl: './admin-video-moderation.component.scss',
})
export class AdminVideoModerationComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChildren('videoElement') videoElements!: QueryList<ElementRef>;

    private videoPlayers = new Map<string, any>();
    showVideo = true;

    statutModeration = StatutModeration;

    // Signals
    loading = signal<boolean>(false);
    moderating = signal<boolean>(false);
    videos = signal<Video[]>([]);
    totalRecords = signal<number>(0);
    currentPage = signal<number>(1);

    // Component state
    pageSize = 10;
    layout: 'list' | 'grid' = 'list';
    layoutOptions = ['list', 'grid'];

    // Search and filters
    searchTerm = '';
    selectedStatus: StatutModeration | null = null;
    selectedSort = 'Created_desc';

    // Dialog states
    videoDetailDialog = false;
    moderationDialog = false;
    selectedVideo: Video | null = null;
    selectedVideoForModeration: Video | null = null;
    moderationAction: 'approve' | 'desapprove' | 'reject' = 'approve';
    moderationComment = '';
    submitted = false;

    // Computed properties
    get pendingCount(): number {
        return this.videos().filter((v) => v.statutModeration === StatutModeration.EnAttente).length;
    }

    // Filter and sort options
    statusFilter: SelectItem[] = [];
    sortOptions: SelectItem[] = [];

    // Search subject for debouncing
    private searchSubject = new Subject<string>();
    private destroy$ = new Subject<void>();

    // Services
    private videoService = inject(VideoService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private translationService = inject(TranslationService);

    constructor(private cdr: ChangeDetectorRef) {}

    ngOnInit() {
        this.initializeOptions();
        this.setupSearch();
        this.loadVideos();
        this.refreshVideo();
    }

    ngOnDestroy() {
        this.videoPlayers.forEach((player) => {
            if (!player.isDisposed()) {
                player.dispose();
            }
        });
        this.videoPlayers.clear();
        this.destroy$.next();
        this.destroy$.complete();
    }

    ngAfterViewInit(): void {
        this.videoElements.changes.subscribe(() => {
            this.initializeVideoPlayers();
        });
        this.initializeVideoPlayers();
        this.initVideos();
    }

    refreshVideo() {
        this.cdr.detectChanges();
        this.showVideo = false;
        setTimeout(() => {
            this.showVideo = true;
        }, 0);
    }

    private initVideos() {
        this.cdr.detectChanges();
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

    private initializeOptions() {
        // Status filter options
        this.statusFilter = [{ label: this.t('admin.video.filter.all'), value: null }, ...this.videoService.getStatutModerationOptions()];

        // Sort options
        this.sortOptions = [
            { label: this.t('admin.video.sort.dateCreation.desc'), value: 'Created_desc' },
            { label: this.t('admin.video.sort.dateCreation.asc'), value: 'Created_asc' },
            { label: this.t('admin.video.sort.title.asc'), value: 'Titre_asc' },
            { label: this.t('admin.video.sort.title.desc'), value: 'Titre_desc' },
            { label: this.t('admin.video.sort.status.asc'), value: 'StatutModeration_asc' },
            { label: this.t('admin.video.sort.status.desc'), value: 'StatutModeration_desc' },
        ];
    }

    private setupSearch() {
        this.searchSubject.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe(() => {
            this.currentPage.set(1);
            this.loadVideos();
        });
    }

    protected t(key: string, params?: Record<string, any>): string {
        return this.translationService.translate(key, params);
    }

    loadVideos() {
        this.loading.set(true);

        const [sortField, sortDirection] = this.selectedSort.split('_');
        const sortOrder = sortDirection === 'asc' ? 1 : -1;

        const params: GetVideosPaginatedRequest = {
            page: this.currentPage(),
            size: this.pageSize,
            sortField,
            sortOrder,
            search: this.searchTerm || undefined,
            status: this.selectedStatus || undefined,
        };

        this.videoService.getAllVideosPaginated(params).subscribe({
            next: (response) => {
                // Process video URLs for display
                const processedVideos = response.items;
                /*const processedVideos = response.items.map((video) => ({
                    ...video,
                    fileItem: video.fileItem ? { ...video.fileItem, url: this.videoService.getVideoPreviewUrl(video.fileItemId) } : video.fileItem,
                }));*/

                this.videos.set(processedVideos);
                this.totalRecords.set(response.totalCount);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Error loading videos:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: this.t('shared.common.error'),
                    detail: this.t('admin.video.messages.loadError'),
                });
                this.loading.set(false);
            },
        });
    }

    onSearchChange() {
        this.searchSubject.next(this.searchTerm);
    }

    onStatusFilterChange() {
        this.currentPage.set(1);
        this.loadVideos();
    }

    onSortChange() {
        this.currentPage.set(1);
        this.loadVideos();
    }

    onPageChange(event: any) {
        const currentPage = event.first / event.rows + 1; // calculate current page
        this.currentPage.set(currentPage);
        this.loadVideos();
    }

    // Video actions
    viewVideo(video: Video) {
        this.selectedVideo = video;
        this.videoDetailDialog = true;
    }

    hideVideoDetail() {
        this.videoDetailDialog = false;
        this.selectedVideo = null;
        this.loadVideos();
    }

    approveVideo(video: Video) {
        this.selectedVideoForModeration = video;
        this.moderationAction = 'approve';
        this.moderationComment = '';
        this.submitted = false;
        this.moderationDialog = true;
    }

    desapproveVideo(video: Video) {
        this.selectedVideoForModeration = video;
        this.moderationAction = 'desapprove';
        this.moderationComment = '';
        this.submitted = false;
        this.moderationDialog = true;
    }

    rejectVideo(video: Video) {
        this.selectedVideoForModeration = video;
        this.moderationAction = 'reject';
        this.moderationComment = '';
        this.submitted = false;
        this.moderationDialog = true;
    }

    hideModerationDialog() {
        this.moderationDialog = false;
        this.selectedVideoForModeration = null;
        this.moderationComment = '';
        this.submitted = false;
        this.loadVideos();
    }

    confirmModeration() {
        this.submitted = true;

        // Validation for rejection - comment is required
        if (this.moderationAction === 'reject' && !this.moderationComment.trim()) {
            return;
        }

        if (!this.selectedVideoForModeration) return;

        this.moderating.set(true);

        const request: ModerateVideoRequest = {
            id: this.selectedVideoForModeration.id,
            statutModeration: this.moderationAction === 'approve' ? StatutModeration.Approuvee : this.moderationAction === 'desapprove' ? StatutModeration.EnAttente : StatutModeration.Rejetee,
            commentaireModeration: this.moderationComment.trim() || undefined,
        };

        this.videoService.moderateVideo(this.selectedVideoForModeration.id, request).subscribe({
            next: (updatedVideo) => {
                // Update video in list
                this.videos.update((videos) =>
                    videos.map((v) =>
                        v.id === updatedVideo.id
                            ? {
                                  ...updatedVideo,
                                  fileItem: v.fileItem, // Keep the processed fileItem with URL
                              }
                            : v,
                    ),
                );

                // Update selected video if detail dialog is open
                if (this.selectedVideo?.id === updatedVideo.id) {
                    this.selectedVideo = {
                        ...updatedVideo,
                        fileItem: this.selectedVideo.fileItem,
                    };
                }

                this.messageService.add({
                    severity: 'success',
                    summary: this.t('shared.common.success'),
                    detail: this.moderationAction === 'approve' ? this.t('admin.video.messages.approved') : this.t('admin.video.messages.rejected'),
                });

                this.hideModerationDialog();
                this.moderating.set(false);
            },
            error: (error) => {
                console.error('Error moderating video:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: this.t('shared.common.error'),
                    detail: this.t('admin.video.messages.moderationError'),
                });
                this.moderating.set(false);
            },
        });
    }

    deleteVideo(video: Video) {
        this.confirmationService.confirm({
            message: this.t('admin.video.confirm.delete', { title: video.titre }),
            header: this.t('shared.common.confirmation'),
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.videoService.deleteVideo(video.id).subscribe({
                    next: () => {
                        this.videos.update((videos) => videos.filter((v) => v.id !== video.id));
                        this.totalRecords.update((total) => total - 1);

                        // Close detail dialog if this video was selected
                        if (this.selectedVideo?.id === video.id) {
                            this.hideVideoDetail();
                        }

                        this.messageService.add({
                            severity: 'success',
                            summary: this.t('shared.common.success'),
                            detail: this.t('admin.video.messages.deleted'),
                        });

                        // Reload if current page is empty
                        if (this.videos().length === 0 && this.currentPage() > 1) {
                            this.currentPage.set(this.currentPage() - 1);
                            this.loadVideos();
                        }
                    },
                    error: (error) => {
                        console.error('Error deleting video:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: this.t('shared.common.error'),
                            detail: this.t('admin.video.messages.deleteError'),
                        });
                    },
                });
            },
        });
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
}
