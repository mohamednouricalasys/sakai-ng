import { Video } from './video.interface';
import { Sport } from '../enums/sport.enum';
import { Tag } from '../enums/tag.enum';

export interface Prodige {
    id?: string;
    nom?: string;
    age?: number;
    sport?: Sport;
    description?: string;
    tags?: Tag[];
    videos?: Video[];
    // Audit fields from BaseAuditableEntity
    dateCreation?: Date;
    dateModification?: Date;
    creePar?: string;
    modifiePar?: string;
}
