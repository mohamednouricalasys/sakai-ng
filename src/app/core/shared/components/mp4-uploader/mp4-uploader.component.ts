// mp4-uploader.component.ts
import { Component, OnInit, OnDestroy, AfterViewInit, Input, Output, EventEmitter, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { ChipModule } from 'primeng/chip';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { PanelModule } from 'primeng/panel';
import { SkeletonModule } from 'primeng/skeleton';
import Uppy from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import Webcam from '@uppy/webcam';
import XHRUpload from '@uppy/xhr-upload';

// Import your translation service
import { TranslationService } from '../../../../core/services/translation.service';

interface FileItem {
    id: string;
    name: string;
    url?: string;
    locked: boolean;
    uploading: boolean;
    progress: number;
    size: number;
}

@Component({
    selector: 'app-mp4-uploader',
    standalone: true,
    imports: [CommonModule, HttpClientModule, CardModule, ButtonModule, ProgressBarModule, ChipModule, DialogModule, ToastModule, TagModule, DividerModule, PanelModule, SkeletonModule],
    providers: [MessageService],
    templateUrl: './mp4-uploader.component.html',
    styleUrls: ['./mp4-uploader.component.scss'],
})
export class Mp4UploaderComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() backendUrl = '/api'; // Your backend URL
    @Output() fileUploaded = new EventEmitter<FileItem>();
    @Output() fileRemoved = new EventEmitter<string>();
    @ViewChild('uppyDashboard', { static: false }) uppyDashboard!: ElementRef;

    private uppy: Uppy | undefined;
    files: FileItem[] = [];
    previewUrl: string | null = null;
    showPreviewDialog = false;

    // Inject translation service
    public translationService = inject(TranslationService);

    constructor(
        private http: HttpClient,
        private messageService: MessageService,
    ) {}

    ngOnInit() {
        // Initialize Uppy but don't mount dashboard yet
        this.initializeUppy();
    }

    ngAfterViewInit() {
        // Mount dashboard after view is initialized
        this.mountDashboard();
    }

    ngOnDestroy() {
        if (this.uppy) {
            this.uppy.destroy();
        }
    }

    // Translation helper method
    protected t(key: string, params?: Record<string, any>): string {
        return this.translationService.translate(key, params);
    }

    private initializeUppy() {
        this.uppy = new Uppy({
            restrictions: {
                maxFileSize: 500 * 1024 * 1024, // 500MB
                maxNumberOfFiles: 10,
                allowedFileTypes: ['video/mp4', '.mp4'],
            },
            autoProceed: false,
            // Set Uppy locale
            locale: this.getUppyLocale(),
        });

        // Add Webcam for recording
        this.uppy.use(Webcam, {
            countdown: false,
            mirror: true,
            videoConstraints: {
                facingMode: 'user',
                width: { min: 640, ideal: 1280, max: 1920 },
                height: { min: 480, ideal: 720, max: 1080 },
            },
            locale: this.getUppyLocale(),
        });

        // Configure XHR Upload
        this.uppy.use(XHRUpload, {
            endpoint: '',
            method: 'PUT',
            headers: {},
            fieldName: 'file',
            locale: this.getUppyLocale(),
        });

        this.setupEventHandlers();
    }

    private mountDashboard() {
        if (this.uppyDashboard && this.uppyDashboard.nativeElement) {
            // Add Dashboard with PrimeNG theme integration
            this.uppy?.use(Dashboard, {
                target: this.uppyDashboard.nativeElement,
                inline: true,
                width: '100%',
                height: 400,
                showProgressDetails: true,
                hideUploadButton: false,
                showRemoveButtonAfterComplete: true,
                note: this.t('uploader.note'),
                theme: 'light',
                proudlyDisplayPoweredByUppy: false,
                locale: this.getUppyLocale(),
            });
        }
    }

    private getUppyLocale(): any {
        const currentLang = this.translationService.getCurrentLanguage();
        const translations = this.translationService.getTranslations();

        // Return Uppy-specific locale strings
        return {
            strings: translations?.uploader?.dashboard?.strings || {},
        };
    }

    private setupEventHandlers() {
        this.uppy?.on('file-added', (file) => {
            this.addFileToList(file);
            this.generatePresignedUrl(file);
        });

        this.uppy?.on('upload-progress', (file: any, progress: any) => {
            this.updateFileProgress(file.id, (progress.bytesUploaded / progress.bytesTotal) * 100);
        });

        this.uppy?.on('upload-success', (file: any, response: any) => {
            this.markFileAsCompleted(file.id, response.uploadURL || this.getFileUrl(file));
            this.messageService.add({
                severity: 'success',
                summary: this.t('uploader.messages.uploadComplete'),
                detail: this.t('uploader.messages.uploadSuccess', { fileName: file.name }),
                life: 3000,
            });
        });

        this.uppy?.on('upload-error', (file: any, error) => {
            this.markFileAsError(file.id);
            this.messageService.add({
                severity: 'error',
                summary: this.t('uploader.messages.uploadFailed'),
                detail: this.t('uploader.messages.uploadFailedDetail', { fileName: file.name }),
                life: 5000,
            });
            console.error('Upload error:', error);
        });

        this.uppy?.on('restriction-failed', (file: any, error) => {
            this.messageService.add({
                severity: 'warn',
                summary: this.t('uploader.messages.fileRestriction'),
                detail: error.message,
                life: 5000,
            });
        });
    }

    private async generatePresignedUrl(file: any) {
        try {
            const response = (await this.http
                .post(`${this.backendUrl}/presigned-url`, {
                    filename: file.name,
                    contentType: file.type,
                })
                .toPromise()) as any;

            // Update XHR upload settings
            this.uppy?.getPlugin('XHRUpload')?.setOptions({
                endpoint: response.uploadUrl,
                headers: response.headers || {},
            });
        } catch (error) {
            console.error('Failed to get presigned URL:', error);
            this.uppy?.removeFile(file.id);
            this.messageService.add({
                severity: 'error',
                summary: this.t('uploader.messages.uploadPreparationFailed'),
                detail: this.t('uploader.messages.uploadPreparationFailedDetail'),
                life: 5000,
            });
        }
    }

    private addFileToList(file: any) {
        const fileItem: FileItem = {
            id: file.id,
            name: file.name,
            size: file.size,
            locked: false,
            uploading: true,
            progress: 0,
        };
        this.files.push(fileItem);
    }

    private updateFileProgress(fileId: string, progress: number) {
        const file = this.files.find((f) => f.id === fileId);
        if (file) {
            file.progress = Math.round(progress);
        }
    }

    private markFileAsCompleted(fileId: string, url: string) {
        const file = this.files.find((f) => f.id === fileId);
        if (file) {
            file.uploading = false;
            file.url = url;
            file.progress = 100;
            this.fileUploaded.emit(file);
            this.checkFileLockStatus(fileId);
        }
    }

    private markFileAsError(fileId: string) {
        const fileIndex = this.files.findIndex((f) => f.id === fileId);
        if (fileIndex > -1) {
            this.files.splice(fileIndex, 1);
        }
    }

    private getFileUrl(file: any): string {
        // Fallback URL generation if not provided in response
        return URL.createObjectURL(file.data);
    }

    private async checkFileLockStatus(fileId: string) {
        try {
            const response = (await this.http.get(`${this.backendUrl}/file-status/${fileId}`).toPromise()) as any;
            const file = this.files.find((f) => f.id === fileId);
            if (file) {
                file.locked = response.locked;
            }
        } catch (error) {
            console.error('Failed to check file lock status:', error);
        }
    }

    async removeFile(fileId: string) {
        const file = this.files.find((f) => f.id === fileId);
        if (!file || file.locked) {
            this.messageService.add({
                severity: 'warn',
                summary: this.t('uploader.messages.cannotRemove'),
                detail: this.t('uploader.messages.cannotRemoveLocked'),
                life: 3000,
            });
            return;
        }

        try {
            await this.http.delete(`${this.backendUrl}/files/${fileId}`).toPromise();

            const index = this.files.findIndex((f) => f.id === fileId);
            if (index > -1) {
                this.files.splice(index, 1);
            }

            if (this.uppy?.getFile(fileId)) {
                this.uppy.removeFile(fileId);
            }

            this.fileRemoved.emit(fileId);
            this.messageService.add({
                severity: 'success',
                summary: this.t('uploader.messages.fileRemoved'),
                detail: this.t('uploader.messages.fileRemovedSuccess'),
                life: 3000,
            });
        } catch (error) {
            console.error('Failed to remove file:', error);
            this.messageService.add({
                severity: 'error',
                summary: this.t('uploader.messages.removalFailed'),
                detail: this.t('uploader.messages.removalFailedDetail'),
                life: 5000,
            });
        }
    }

    previewFile(file: FileItem) {
        this.previewUrl = file.url || null;
        this.showPreviewDialog = true;
    }

    closePreview() {
        this.showPreviewDialog = false;
        this.previewUrl = null;
    }

    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getUploadingCount(): number {
        return this.files.filter((f) => f.uploading).length;
    }

    getCompletedCount(): number {
        return this.files.filter((f) => !f.uploading && f.url).length;
    }

    // Method to update Uppy locale when language changes
    public updateLocale() {
        if (this.uppy) {
            const newLocale = this.getUppyLocale();

            // Update Dashboard locale
            const dashboardPlugin = this.uppy.getPlugin('Dashboard');
            if (dashboardPlugin) {
                dashboardPlugin.setOptions({ locale: newLocale });
            }

            // Update Webcam locale
            const webcamPlugin = this.uppy.getPlugin('Webcam');
            if (webcamPlugin) {
                webcamPlugin.setOptions({ locale: newLocale });
            }

            // Update XHR Upload locale
            const xhrPlugin = this.uppy.getPlugin('XHRUpload');
            if (xhrPlugin) {
                xhrPlugin.setOptions({ locale: newLocale });
            }
        }
    }
}
