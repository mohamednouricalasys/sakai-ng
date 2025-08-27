import { Video } from './video.interface';
import { Sport } from '../enums/sport.enum';
import { Tag } from '../enums/tag.enum';
import { Genre } from '../enums/gender.enum';

export interface Prodige {
    id?: string;
    userId?: string;
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
    pays?: string;
    genre?: Genre;
}
