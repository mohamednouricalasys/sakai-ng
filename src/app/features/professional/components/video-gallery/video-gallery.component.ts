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
import { DialogModule } from 'primeng/dialog';
import { ChipsModule } from 'primeng/chips';
import { TranslatePipe } from '../../../../core/shared';
import { COUNTRIES_DATA } from '../../../../core/shared/countries-data';
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
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/interfaces/user.interface';
import { VideoFilterType } from '../../../../core/enums/video-filter-type.enum';

@Component({
    selector: 'app-video-gallery',
    standalone: true,
    imports: [
        CommonModule,
        DialogModule,
        FormsModule,
        InfiniteScrollModule,
        ButtonModule,
        CardModule,
        RadioButtonModule,
        ChipsModule,
        InputGroupModule,
        InputGroupAddonModule,
        InputTextModule,
        SelectModule,
        TagModule,
        ToastModule,
        TranslatePipe,
        DividerModule,
    ],
    templateUrl: './video-gallery.component.html',
    providers: [MessageService],
    styleUrl: './video-gallery.component.scss',
})
export class VideoGalleryComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChildren('videoElement') videoElements!: QueryList<ElementRef>;

    private videoPlayers = new Map<string, any>();

    user: User | undefined;

    // Signals
    loading = signal<boolean>(false);
    videos = signal<Video[]>([]);
    hasMore = signal<boolean>(true);

    // Component state
    pageSize = 10;
    currentPage = 1;
    totalLoaded = 0;

    // Mobile detection for infinite scroll
    isMobile = false;

    // Search and filters
    searchTerm = '';
    selectedSport: Sport | null = null;
    selectedTag: Tag | null = null;
    selectedGenre: Genre | null = null;
    selectedCountry: string | null = null;
    selectedVideoFilterType: VideoFilterType | null = null;

    // Filter options
    sportOptions: SelectItem[] = [];
    tagOptions: SelectItem[] = [];
    genreOptions: SelectItem[] = [];
    countryOptions: SelectItem[] = [];
    videoFilterOptions: SelectItem[] = [];

    // Contact dialog state
    contactDialogVisible = false;
    selectedVideo: any = null;

    // Info dialog state
    infoDialogVisible = false;
    infoDialogVideo: Video | null = null;

    // Search subject for debouncing
    private searchSubject = new Subject<string>();
    private destroy$ = new Subject<void>();
    private resizeHandler = this.onResize.bind(this);

    // Screen orientation for mobile fullscreen
    private orientationLocked = false;

    // Services
    private prodigeService = inject(ProdigeService);
    private videoService = inject(VideoService);
    private messageService = inject(MessageService);
    private translationService = inject(TranslationService);
    private userService = inject(UserService);

    constructor() {}

    async ngOnInit() {
        this.checkMobile();
        window.addEventListener('resize', this.resizeHandler);

        if (!this.isMobile) {
            document.querySelector('.layout-main-container')?.classList.add('no-scroll');
        }

        this.initializeOptions();
        this.setupSearch();
        this.loadInitialVideos();
    }

    private checkMobile(): void {
        this.isMobile = window.innerWidth <= 768;
    }

    private onResize(): void {
        const wasMobile = this.isMobile;
        this.checkMobile();

        if (wasMobile !== this.isMobile) {
            const container = document.querySelector('.layout-main-container');
            if (this.isMobile) {
                container?.classList.remove('no-scroll');
            } else {
                container?.classList.add('no-scroll');
            }
        }
    }

    ngOnDestroy() {
        window.removeEventListener('resize', this.resizeHandler);
        document.querySelector('.layout-main-container')?.classList.remove('no-scroll');
        this.unlockOrientation();

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
                this.setupFullscreenOrientationHandler(player);
            }
        });
    }

    private setupFullscreenOrientationHandler(player: any): void {
        player.on('fullscreenchange', () => {
            if (!this.isMobile) return;

            if (player.isFullscreen()) {
                this.lockLandscapeOrientation();
            } else {
                this.unlockOrientation();
            }
        });
    }

    private async lockLandscapeOrientation(): Promise<void> {
        try {
            const screenOrientation = screen.orientation as ScreenOrientation & { lock?: (orientation: string) => Promise<void> };
            if (screenOrientation?.lock) {
                await screenOrientation.lock('landscape');
                this.orientationLocked = true;
            }
        } catch (error) {
            console.debug('Screen orientation lock not available:', error);
        }
    }

    private unlockOrientation(): void {
        try {
            if (this.orientationLocked && screen.orientation?.unlock) {
                screen.orientation.unlock();
                this.orientationLocked = false;
            }
        } catch (error) {
            console.debug('Screen orientation unlock failed:', error);
        }
    }

    private initializeOptions() {
        this.sportOptions = [{ label: this.t('videos.filter.allSports'), value: null }, ...this.prodigeService.getSportOptions()];
        this.tagOptions = [{ label: this.t('videos.filter.allTags'), value: null }, ...this.prodigeService.getTagOptions()];
        this.genreOptions = [
            { label: this.t('videos.filter.allGenders'), value: null },
            { label: '♂ ' + this.t('videos.filter.homme'), value: Genre.Homme },
            { label: '♀ ' + this.t('videos.filter.femme'), value: Genre.Femme },
        ];
        this.countryOptions = [
            { label: this.t('videos.filter.allCountries'), value: null },
            ...COUNTRIES_DATA.map((country) => ({
                label: `${country.flag} ${country.code}`,
                value: country.code,
            })),
        ];
        this.videoFilterOptions = [
            { label: this.t('videos.filter.all'), value: VideoFilterType.All },
            { label: this.t('videos.filter.newVideoNewContact'), value: VideoFilterType.NewVideoNewContact },
            { label: this.t('videos.filter.newVideoOldContact'), value: VideoFilterType.NewVideoOldContact },
            { label: this.t('videos.filter.alreadyReadVideo'), value: VideoFilterType.AlreadyReadVideo },
            { label: this.t('videos.filter.myVideos'), value: VideoFilterType.MyVideos },
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
            country: this.selectedCountry || undefined,
            connectedUserId: this.userService.getProfile()?.id || '',
            videoFilterType: this.selectedVideoFilterType || VideoFilterType.All,
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

    onCountryFilterChange() {
        this.resetAndSearch();
    }

    onVideoFilterChange() {
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
        this.selectedCountry = null;
        this.selectedVideoFilterType = null;
        this.resetAndSearch();
    }

    getVideoFilterLabel(filterType: VideoFilterType): string {
        const option = this.videoFilterOptions.find((opt) => opt.value === filterType);
        return option?.label || '';
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

    getCountryFlag(countryCode?: string): string {
        if (!countryCode) return '';
        const country = COUNTRIES_DATA.find((c) => c.code === countryCode.toUpperCase());
        return country?.flag || '';
    }

    getCountryDisplay(countryCode?: string): string {
        if (!countryCode) return '';
        const flag = this.getCountryFlag(countryCode);
        return flag ? `${flag} ${countryCode.toUpperCase()}` : countryCode.toUpperCase();
    }

    openContactDialog(video: any): void {
        this.userService.getUserById(video.prodige.userId, video.id).subscribe({
            next: (data) => {
                this.user = data;
                this.selectedVideo = video;
                this.contactDialogVisible = true;

                if (video.prodige?.id) {
                    this.prodigeService.incrementContactClick(video.prodige.id).subscribe({
                        error: (err) => console.error('Error incrementing contact click:', err),
                    });
                }
            },
            error: (error) => {
                console.error('Error loading user:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: this.t('shared.common.error'),
                    detail: this.t('shared.messages.dataLoadError'),
                });
            },
        });
    }

    closeContactDialog(): void {
        this.contactDialogVisible = false;
        this.selectedVideo = null;
    }

    getContactEmail(video: any): string {
        return this.user?.email ?? '';
    }

    getContactPhone(video: any): string {
        return this.user?.phone ?? '';
    }

    getFullName(): string {
        if (!this.user) return '';
        const firstName = this.user.firstName || '';
        const lastName = this.user.lastName || '';
        return `${firstName} ${lastName}`.trim();
    }

    copyToClipboard(value: string): void {
        if (!value) return;
        navigator.clipboard.writeText(value).then(() => {
            this.messageService.add({
                severity: 'info',
                summary: this.t('primeng.information'),
                detail: this.t('uploader.dashboard.strings.copyLinkToClipboardSuccess'),
            });
        });
    }

    openInfoDialog(video: Video): void {
        this.infoDialogVideo = video;
        this.infoDialogVisible = true;

        if (video.prodige?.id) {
            this.prodigeService.incrementView(video.prodige.id).subscribe({
                error: (err) => console.error('Error incrementing view:', err),
            });
        }
    }

    closeInfoDialog(): void {
        this.infoDialogVisible = false;
        this.infoDialogVideo = null;
    }
}
