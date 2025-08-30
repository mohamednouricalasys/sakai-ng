import { StatutModeration } from '../enums/statut-moderation.enum';
import { FileItem } from './file-Item.interface';
import { Prodige } from './prodige.interface';
import { Sport } from '../enums/sport.enum';
import { Tag } from '../enums/tag.enum';
import { Genre } from '../enums/gender.enum';

export interface Video {
    id: string;
    titre: string;
    description: string;
    uniqueFilename: string;
    fileItemId: string;
    fileItem: FileItem;
    statutModeration: StatutModeration;
    prodigeId: string;
    prodige: Prodige;
    commentaireModeration?: string;
    moderatedBy?: string;
    dateModeration?: Date;
    dateCreation?: Date;
}

export interface CreateVideoRequest {
    titre: string;
    description: string;
    uniqueFilename: string;
    prodigeId: string;
    commentaireModeration?: string;
}

export interface UpdateVideoRequest {
    id: string;
    titre: string;
    description: string;
    uniqueFilename: string;
}

export interface ModerateVideoRequest {
    id: string;
    statutModeration: StatutModeration;
    commentaireModeration?: string;
}

export interface GetVideosPaginatedRequest {
    page?: number;
    size?: number;
    sortField?: string;
    sortOrder?: number;
    search?: string;
    status?: StatutModeration;
    tag?: Tag;
    sport?: Sport;
    genre?: Genre;
}

export interface PaginatedList<T> {
    items: T[];
    totalCount: number;
    page: number;
    size: number;
    totalPages: number;
}
