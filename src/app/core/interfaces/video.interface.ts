import { StatutModeration } from '../enums/statut-moderation.enum';
import { VideoStatus } from '../enums/video-status.enum';
import { FileItem } from './file-Item.interface';
import { Prodige } from './prodige.interface';

export interface Video {
    id: string;
    titre: string;
    description: string;
    fileItemId: string;
    fileItem: FileItem;
    prodigeId: string;
    prodige: Prodige;
    statutModeration: StatutModeration;
    commentaireModeration?: string;
}

export interface CreateVideoRequest {
    titre: string;
    description: string;
    fileItemId: string;
    prodigeId: string;
    statutModeration: StatutModeration;
    commentaireModeration?: string;
}

export interface UpdateVideoRequest {
    id: string;
    titre: string;
    description: string;
    fileItemId: string;
    prodigeId: string;
    statutModeration: StatutModeration;
    commentaireModeration?: string;
}

export interface PaginatedList<T> {
    items: T[];
    pageNumber: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface GetVideosPaginatedRequest {
    pageNumber?: number;
    pageSize?: number;
}
