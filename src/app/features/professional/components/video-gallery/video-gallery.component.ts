import { Component, inject, OnInit, signal, OnDestroy, AfterViewInit, QueryList, ElementRef, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { MessageService, SelectItem } from 'primeng/api';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { TranslatePipe } from '../../../../core/shared';
import { VideoService } from '../../../../core/services/video.service';
import { Video, GetVideosPaginatedRequest } from '../../../../core/interfaces/video.interface';
import { TranslationService } from '../../../../core/services/translation.service';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import videojs from 'video.js';
import { Sport } from '../../../../core/enums/sport.enum';
import { ProdigeService } from '../../../../core/services/prodige.service';
import { Tag } from '../../../../core/enums/tag.enum';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Genre } from '../../../../core/enums/gender.enum';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@Component({
    selector: 'app-video-gallery',
    standalone: true,
    imports: [CommonModule, FormsModule, InfiniteScrollModule, ButtonModule, CardModule, RadioButtonModule, InputGroupModule, InputGroupAddonModule, InputTextModule, SelectModule, TagModule, ToastModule, TranslatePipe, DividerModule],
    templateUrl: './video-gallery.component.html',
    providers: [MessageService],
    styleUrl: './video-gallery.component.scss',
})
export class VideoGalleryComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChildren('videoElement') videoElements!: QueryList<ElementRef>;

    private videoPlayers = new Map<string, any>();

    // Signals
    loading = signal<boolean>(false);
    videos = signal<Video[]>([]);
    hasMore = signal<boolean>(true);

    // Component state
    pageSize = 5;
    currentPage = 1;
    totalLoaded = 0;

    // Search and filters
    searchTerm = '';
    selectedSport: Sport | null = null;
    selectedTag: Tag | null = null;
    selectedGenre: Genre | null = null;

    // Filter options
    sportOptions: SelectItem[] = [];
    tagOptions: SelectItem[] = [];
    genreOptions: SelectItem[] = [];

    // Search subject for debouncing
    private searchSubject = new Subject<string>();
    private destroy$ = new Subject<void>();

    // Services
    private prodigeService = inject(ProdigeService);
    private videoService = inject(VideoService);
    private messageService = inject(MessageService);
    private translationService = inject(TranslationService);

    ngOnInit() {
        this.initializeOptions();
        this.setupSearch();
        this.loadInitialVideos();
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
    }

    private initializeVideoPlayers(): void {
        this.videoElements.forEach((el) => {
            const videoId = el.nativeElement.id;
            if (!this.videoPlayers.has(videoId)) {
                const options = {
                    controls: true,
                    autoplay: false,
                    preload: 'metadata',
                    responsive: true,
                    fluid: true,
                };
                const player = videojs(el.nativeElement, options);
                this.videoPlayers.set(videoId, player);
            }
        });
    }

    private initializeOptions() {
        this.sportOptions = [{ label: this.t('videos.filter.allSports'), value: null }, ...this.prodigeService.getSportOptions()];

        this.tagOptions = [{ label: this.t('videos.filter.allTags'), value: null }, ...this.prodigeService.getTagOptions()];

        this.genreOptions = [
            { label: this.t('videos.filter.allGenders'), value: null },
            { label: '♂ ' + this.t('videos.filter.homme'), value: Genre.Homme },
            { label: '♀ ' + this.t('videos.filter.femme'), value: Genre.Femme },
        ];
    }

    private setupSearch() {
        this.searchSubject.pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe(() => {
            this.resetAndSearch();
        });
    }

    protected t(key: string, params?: Record<string, any>): string {
        return this.translationService.translate(key, params);
    }

    loadInitialVideos() {
        this.loading.set(true);
        this.currentPage = 1;
        this.loadVideos(true);
    }

    private loadVideos(reset: boolean = false) {
        const params: GetVideosPaginatedRequest = {
            page: this.currentPage,
            size: this.pageSize,
            sortField: 'Created',
            sortOrder: -1,
            search: this.searchTerm,
            sport: this.selectedSport || undefined,
            tag: this.selectedTag || undefined,
            genre: this.selectedGenre || undefined,
        };

        this.videoService.getApprouvedVideosPaginated(params).subscribe({
            next: (response) => {
                const newVideos = response.items;

                if (reset) {
                    this.videos.set(newVideos);
                    this.totalLoaded = newVideos.length;
                } else {
                    this.videos.update((videos) => [...videos, ...newVideos]);
                    this.totalLoaded += newVideos.length;
                }

                this.hasMore.set(this.totalLoaded < response.totalCount);
                this.loading.set(false);

                setTimeout(() => this.initializeVideoPlayers(), 100);
            },
            error: (error) => {
                console.error('Error loading videos:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: this.t('shared.common.error'),
                    detail: this.t('videos.messages.loadError'),
                });
                this.loading.set(false);
            },
        });
    }

    onSearchChange() {
        this.searchSubject.next(this.searchTerm);
    }

    onSportFilterChange() {
        this.resetAndSearch();
    }

    onTagFilterChange() {
        this.resetAndSearch();
    }

    onGenreFilterChange() {
        this.resetAndSearch();
    }

    private resetAndSearch() {
        this.currentPage = 1;
        this.totalLoaded = 0;
        this.hasMore.set(true);
        this.videos.set([]);
        this.loadVideos(true);
    }

    clearFilters() {
        this.searchTerm = '';
        this.selectedSport = null;
        this.selectedTag = null;
        this.selectedGenre = null;
        this.resetAndSearch();
    }

    onScroll(event: any) {
        if (!this.hasMore() || this.loading()) return;

        this.currentPage++;
        this.loadVideos(false);
    }

    trackByVideoId(index: number, video: Video): string {
        return video.id;
    }

    formatVideoTitle(title?: string): string {
        if (!title) return '';
        return title.length > 60 ? title.substring(0, 60) + '...' : title;
    }

    formatVideoDescription(description?: string): string {
        if (!description) return '';
        return description.length > 100 ? description.substring(0, 100) + '...' : description;
    }

    getVideoThumbnail(video: Video): string {
        return video.fileItem?.url || '';
    }

    getSportLabel(sport: Sport): string {
        return this.prodigeService.getSportLabel(sport);
    }

    getTagLabel(tag: Tag): string {
        return this.prodigeService.getTagLabel(tag);
    }

    getExtraTagsCount(video: any): number {
        return (video?.prodige?.tags?.length ?? 0) > 3 ? video.prodige.tags.length - 3 : 0;
    }
}
