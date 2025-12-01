import { Prodige } from '../../../../core/interfaces/prodige.interface';
import { Sport } from '../../../../core/enums/sport.enum';

export function validateProdige(prodige: Prodige) {
    if (!prodige.nom?.trim()) return 'Name is required';
    if (!prodige.age) return 'Age is required';
    if (prodige?.tags && prodige.tags?.length < 3) return 'At least 3 tags required';
    if (prodige?.tags && prodige.tags?.length > 10) return 'Maximum 10 tags allowed';
    if (prodige.sport === Sport.Autre && !prodige.description?.trim()) {
        return 'Description is required for "Other" sport';
    }
    return null;
}
