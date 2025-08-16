// mp4-uploader.component.ts
import { Component, OnInit, OnDestroy, AfterViewInit, Input, Output, EventEmitter, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
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
import { MessageModule } from 'primeng/message';
import { TranslatePipe, TranslateParamsPipe } from '../../../../core/shared';
import Uppy from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import Webcam from '@uppy/webcam';
import XHRUpload from '@uppy/xhr-upload';

// Import services
import { TranslationService } from '../../../../core/services/translation.service';
import { FileItem } from '../../../interfaces/file-Item.interface';
import { FileUploadService, PresignedUrlRequest } from '../../../services/file-upload.service';

@Component({
    selector: 'app-mp4-uploader',
    standalone: true,
    imports: [CommonModule, TranslatePipe, TranslateParamsPipe, HttpClientModule, CardModule, ButtonModule, ProgressBarModule, ChipModule, DialogModule, ToastModule, TagModule, DividerModule, PanelModule, SkeletonModule, MessageModule],
    providers: [MessageService],
    templateUrl: './mp4-uploader.component.html',
    styleUrls: ['./mp4-uploader.component.scss'],
})
export class Mp4UploaderComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() maxFiles: number = 1; // Maximum number of files allowed
    @Input() maxFileSize: number = 500 * 1024 * 1024; // Default 500MB
    @Input() allowedFileTypes: string[] = ['video/mp4', '.mp4']; // Allowed file types

    @Output() fileUploaded = new EventEmitter<FileItem>();
    @Output() fileRemoved = new EventEmitter<string>();
    @ViewChild('uppyDashboard', { static: false }) uppyDashboard!: ElementRef;

    private uppy: Uppy | undefined;
    files: FileItem[] = [];
    previewUrl: string | null = null;
    showPreviewDialog = false;

    // Inject services
    public translationService = inject(TranslationService);
    private fileUploadService = inject(FileUploadService);

    constructor(private messageService: MessageService) {}

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

    /**
     * Check if the maximum number of files has been reached
     */
    hasReachedFileLimit(): boolean {
        return this.files.length >= this.maxFiles;
    }

    /**
     * Get the remaining file slots
     */
    private getRemainingFileSlots(): number {
        return Math.max(0, this.maxFiles - this.files.length);
    }

    /**
     * Check if a file is a duplicate based on name, size, and last modified date
     */
    private isDuplicateFile(file: any): boolean {
        return this.files.some((existingFile) => {
            // Compare by name and size
            const sameNameAndSize = existingFile.name === file.name && existingFile.size === file.size;

            // Fallback to name and size comparison
            return sameNameAndSize;
        });
    }

    /**
     * Generate a unique filename by adding GUID before file extension
     */
    private generateUniqueFilename(originalFilename: string): string {
        const guid = this.generateGuid();
        const lastDotIndex = originalFilename.lastIndexOf('.');

        if (lastDotIndex === -1) {
            // No extension found, just append GUID
            return `${originalFilename}_${guid}`;
        }

        // Insert GUID before extension
        const nameWithoutExt = originalFilename.substring(0, lastDotIndex);
        const extension = originalFilename.substring(lastDotIndex);
        return `${nameWithoutExt}_${guid}${extension}`;
    }

    /**
     * Generate a GUID (UUID v4)
     */
    private generateGuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    private initializeUppy() {
        this.uppy = new Uppy({
            restrictions: {
                maxFileSize: this.maxFileSize,
                maxNumberOfFiles: this.maxFiles,
                allowedFileTypes: this.allowedFileTypes,
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
                note: this.getUploaderNote(),
                theme: 'light',
                proudlyDisplayPoweredByUppy: false,
                locale: this.getUppyLocale(),
            });
        }
    }

    /**
     * Get the uploader note based on maxFiles configuration
     */
    private getUploaderNote(): string {
        if (this.maxFiles === 1) {
            return this.t('uploader.note.single', {
                maxSize: this.formatFileSize(this.maxFileSize),
            });
        } else {
            return this.t('uploader.note.multiple', {
                maxFiles: this.maxFiles,
                maxSize: this.formatFileSize(this.maxFileSize),
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
            // Check file limit before processing
            if (this.hasReachedFileLimit()) {
                this.messageService.add({
                    severity: 'warn',
                    summary: this.t('uploader.messages.fileLimitReached'),
                    detail: this.t('uploader.messages.fileLimitReachedDetail', {
                        maxFiles: this.maxFiles,
                    }),
                    life: 5000,
                });

                // Remove the file from Uppy
                this.uppy?.removeFile(file.id);
                return;
            }

            // Check for duplicate files before processing
            if (this.isDuplicateFile(file)) {
                this.messageService.add({
                    severity: 'warn',
                    summary: this.t('uploader.messages.duplicateFile'),
                    detail: this.t('uploader.messages.duplicateFileDetail', { fileName: file.name }),
                    life: 5000,
                });

                // Remove the duplicate file from Uppy
                this.uppy?.removeFile(file.id);
                return;
            }

            // Generate unique filename before adding to list
            const uniqueFilename = this.generateUniqueFilename(file?.name!);

            // Update the file object with unique filename
            file.meta = { ...file.meta, uniqueFilename };

            this.addFileToList(file, uniqueFilename);
            this.generatePutPresignedUrl(file, uniqueFilename);
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

    private async generatePutPresignedUrl(file: any, uniqueFilename: string) {
        try {
            const request: PresignedUrlRequest = {
                filename: uniqueFilename, // Use unique filename instead of original
                contentType: file.type,
                action: 'put',
            };

            const response = await this.fileUploadService.generatePresignedUrl(request);

            // Update XHR upload settings
            this.uppy?.getPlugin('XHRUpload')?.setOptions({
                endpoint: response.uploadUrl,
                method: 'PUT',
                headers: {
                    'Content-Type': file.type, // must match presigned URL
                    ...(response.headers || {}), // any extra headers from backend
                },
                formData: false, // send raw file, not multipart
                getResponseData: () => {
                    // S3 returns often empty or XML response, so return URL directly
                    return { url: response.uploadUrl };
                },
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

    private async generateGetPresignedUrl(file: any): Promise<string> {
        try {
            // Use the unique filename stored in the file item
            const fileItem = this.files.find((f) => f.id === file.id);
            const filename = fileItem?.uniqueFilename || file.meta?.uniqueFilename || file.name;

            const request: PresignedUrlRequest = {
                filename: filename,
                contentType: file.type || 'video/mp4',
                action: 'get',
            };

            const response = await this.fileUploadService.generatePresignedUrl(request);

            if (!response.url) {
                throw new Error('No URL returned');
            }

            return response.url;
        } catch (error) {
            console.error('Failed to get presigned URL:', error);
            this.uppy?.removeFile(file.id);
            this.messageService.add({
                severity: 'error',
                summary: this.t('uploader.messages.uploadPreparationFailed'),
                detail: this.t('uploader.messages.uploadPreparationFailedDetail'),
                life: 5000,
            });
            throw error; // Let the caller handle the failure
        }
    }

    private addFileToList(file: any, uniqueFilename: string) {
        const fileItem: FileItem = {
            id: file.id,
            name: file.name, // Keep original name for display
            uniqueFilename: uniqueFilename, // Store unique filename
            size: file.size,
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

            this.fileUploadService.createFileItem(file).subscribe({
                next: (result) => {
                    console.log('Fichier créé:', result);
                },
                error: (err) => {
                    console.error('Erreur lors de la création:', err);
                },
            });

            this.fileUploaded.emit(file);
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

    async removeFile(fileId: string) {
        const file = this.files.find((f) => f.id === fileId);
        if (!file) {
            this.messageService.add({
                severity: 'warn',
                summary: this.t('uploader.messages.cannotRemove'),
                detail: this.t('uploader.messages.cannotRemoveLocked'),
                life: 3000,
            });
            return;
        }

        try {
            await this.fileUploadService.removeFile(file?.uniqueFilename!);

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

    async previewFile(file: FileItem) {
        try {
            this.previewUrl = await this.generateGetPresignedUrl(file);
            this.showPreviewDialog = true;
        } catch (error) {
            // Error handling is already done in generateGetPresignedUrl
            console.error('Preview failed:', error);
        }
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

            // Update Dashboard locale and note
            const dashboardPlugin = this.uppy.getPlugin('Dashboard');
            if (dashboardPlugin) {
                dashboardPlugin.setOptions({
                    locale: newLocale,
                    note: this.getUploaderNote(),
                });
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

    // Method to update restrictions when input changes
    public updateRestrictions() {
        if (this.uppy) {
            this.uppy.setOptions({
                restrictions: {
                    maxFileSize: this.maxFileSize,
                    maxNumberOfFiles: this.maxFiles,
                    allowedFileTypes: this.allowedFileTypes,
                },
            });

            // Update dashboard note
            const dashboardPlugin = this.uppy.getPlugin('Dashboard');
            if (dashboardPlugin) {
                dashboardPlugin.setOptions({
                    note: this.getUploaderNote(),
                });
            }
        }
    }
}
