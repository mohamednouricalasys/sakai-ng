// file-upload.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FileItem } from '../interfaces/file-Item.interface';

export interface PresignedUrlRequest {
    filename: string;
    contentType: string;
    action: 'put' | 'get';
}

export interface PresignedUrlResponse {
    uploadUrl?: string;
    url?: string;
    headers?: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class FileUploadService {
    private apiUrl;

    constructor(
        private http: HttpClient,
        private keycloakService: KeycloakService,
    ) {
        this.apiUrl = environment.apiUrl + '/FileItems';
    }

    createFileItem(fileItem: FileItem): Observable<FileItem> {
        return this.http.post<FileItem>(this.apiUrl, fileItem);
    }

    private async getAuthHeaders(): Promise<HttpHeaders> {
        const token = await this.keycloakService.getToken();
        return new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        });
    }

    /**
     * Generate presigned URL for file upload or download
     */
    async generatePresignedUrl(request: PresignedUrlRequest): Promise<PresignedUrlResponse> {
        try {
            const headers = await this.getAuthHeaders();

            const response = await firstValueFrom(this.http.post<PresignedUrlResponse>(`${this.apiUrl}/presigned-url`, request, { headers }));

            return response;
        } catch (error) {
            console.error('Failed to generate presigned URL:', error);
            throw error;
        }
    }

    /**
     * Remove file from backend
     */
    async removeFile(fileId: string): Promise<void> {
        try {
            const headers = await this.getAuthHeaders();

            await firstValueFrom(this.http.delete(`${this.apiUrl}/${fileId}`, { headers }));
        } catch (error) {
            console.error('Failed to remove file:', error);
            throw error;
        }
    }

    /**
     * Upload file using presigned URL (direct to S3/storage)
     */
    async uploadFileToPresignedUrl(presignedUrl: string, file: File, contentType: string, additionalHeaders?: Record<string, string>): Promise<void> {
        try {
            const headers = new HttpHeaders({
                'Content-Type': contentType,
                ...(additionalHeaders || {}),
            });

            await firstValueFrom(this.http.put(presignedUrl, file, { headers }));
        } catch (error) {
            console.error('Failed to upload file to presigned URL:', error);
            throw error;
        }
    }

    /**
     * Get file list from backend (optional method for future use)
     */
    async getFileList(): Promise<any[]> {
        try {
            const headers = await this.getAuthHeaders();

            const response = await firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/files`, { headers }));

            return response;
        } catch (error) {
            console.error('Failed to get file list:', error);
            throw error;
        }
    }

    /**
     * Update file metadata (optional method for future use)
     */
    async updateFileMetadata(backendUrl: string, fileId: string, metadata: any): Promise<any> {
        try {
            const headers = await this.getAuthHeaders();

            const response = await firstValueFrom(this.http.put<any>(`${backendUrl}/files/${fileId}`, metadata, { headers }));

            return response;
        } catch (error) {
            console.error('Failed to update file metadata:', error);
            throw error;
        }
    }
}
