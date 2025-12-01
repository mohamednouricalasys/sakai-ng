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

    // Used in markFileAsCompleted() method
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

    // Used in generatePutPresignedUrl() and generateGetPresignedUrl() methods
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

    // Used in removeFile() method
    async removeFile(fileId: string): Promise<void> {
        try {
            const headers = await this.getAuthHeaders();

            await firstValueFrom(this.http.delete(`${this.apiUrl}/${fileId}`, { headers }));
        } catch (error) {
            console.error('Failed to remove file:', error);
            throw error;
        }
    }
}
