import { VideoStatus } from '../enums/video-status.enum';

export interface Video {
    id?: string;
    titre?: string;
    description?: string;
    url?: string;
    etat?: VideoStatus;
    // Link to the parent prodige
    prodigeId?: string;
    // Audit fields from BaseAuditableEntity
    dateCreation?: Date;
    dateModification?: Date;
    creePar?: string;
    modifiePar?: string;
}
