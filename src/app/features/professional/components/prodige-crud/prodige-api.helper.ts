import { Observable, catchError, of, finalize } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Prodige } from '../../../../core/interfaces/prodige.interface';
import { ProdigeService } from '../../../../core/services/prodige.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { UserService } from '../../../../core/services/user.service';

export interface ApiPayload {
    userId?: string;
    nom?: string;
    age?: number;
    sport?: number;
    description?: string;
    pays?: string;
    genre?: number;
    tags?: number[];
}

export interface ApiCallbacks {
    onLoadingStart: () => void;
    onLoadingEnd: () => void;
    onSavingStart: () => void;
    onSavingEnd: () => void;
    onDeletingStart: () => void;
    onDeletingEnd: () => void;
    onError: (error: string) => void;
    onSuccess: (prodige: Prodige) => void;
    onDelete: (prodigeId: string) => void;
}

export class ProdigeApiHelper {
    /**
     * Prepares API payload from a Prodige object
     */
    static prepareApiPayload(prodige: Prodige): ApiPayload {
        return {
            userId: prodige.userId,
            nom: prodige.nom,
            age: prodige.age,
            sport: prodige.sport,
            description: prodige.description || '',
            pays: prodige.pays || 'FR',
            genre: prodige.gender,
            tags: prodige.tags,
        };
    }

    /**
     * Loads prodigies with error handling and loading states
     */
    static loadProdigies(
        prodigeService: ProdigeService,
        userService: UserService,
        translationService: TranslationService,
        messageService: MessageService,
        callbacks: Pick<ApiCallbacks, 'onLoadingStart' | 'onLoadingEnd' | 'onError' | 'onSuccess'>,
    ): Observable<Prodige[]> {
        callbacks.onLoadingStart();

        const profile = userService.getProfile();
        return prodigeService.getProdigiesByUserId(profile?.id!).pipe(
            catchError((error) => {
                console.error('Error loading prodigies:', error);
                callbacks.onError('Failed to load prodigies');
                messageService.add({
                    severity: 'error',
                    summary: translationService.translate('shared.messages.error'),
                    detail: translationService.translate('procrud.messages.loadError') || 'Failed to load prodigies',
                    life: 3000,
                });
                return of([]);
            }),
            finalize(() => callbacks.onLoadingEnd()),
        );
    }

    /**
     * Creates a new prodige with error handling and loading states
     */
    static createProdige(
        prodige: Prodige,
        prodigeService: ProdigeService,
        userService: UserService,
        translationService: TranslationService,
        messageService: MessageService,
        callbacks: Pick<ApiCallbacks, 'onSavingStart' | 'onSavingEnd' | 'onError' | 'onSuccess'>,
    ): Observable<Prodige | null> {
        callbacks.onSavingStart();

        const profile = userService.getProfile();
        const apiPayload = this.prepareApiPayload(prodige);
        apiPayload.userId = profile?.id; // Set userId from profile

        return prodigeService.createProdige(apiPayload).pipe(
            catchError((error) => {
                console.error('Error creating prodige:', error);
                callbacks.onError('Failed to create prodige');
                messageService.add({
                    severity: 'error',
                    summary: translationService.translate('shared.messages.error'),
                    detail: translationService.translate('procrud.messages.createError'),
                    life: 3000,
                });
                return of(null);
            }),
            finalize(() => callbacks.onSavingEnd()),
        );
    }

    /**
     * Updates an existing prodige with error handling and loading states
     */
    static updateProdige(
        prodige: Prodige,
        prodigeService: ProdigeService,
        translationService: TranslationService,
        messageService: MessageService,
        callbacks: Pick<ApiCallbacks, 'onSavingStart' | 'onSavingEnd' | 'onError' | 'onSuccess'>,
    ): Observable<Prodige | null> {
        if (!prodige.id) {
            throw new Error('Prodige ID is required for update');
        }

        callbacks.onSavingStart();

        const apiPayload = this.prepareApiPayload(prodige);

        return prodigeService.updateProdige(prodige.id, { id: prodige.id, ...apiPayload }).pipe(
            catchError((error) => {
                console.error('Error updating prodige:', error);
                callbacks.onError('Failed to update prodige');
                messageService.add({
                    severity: 'error',
                    summary: translationService.translate('shared.messages.error'),
                    detail: translationService.translate('procrud.messages.updateError'),
                    life: 3000,
                });
                return of(null);
            }),
            finalize(() => callbacks.onSavingEnd()),
        );
    }

    /**
     * Deletes a prodige with error handling and loading states
     */
    static deleteProdige(
        prodigeId: string,
        prodigeService: ProdigeService,
        translationService: TranslationService,
        messageService: MessageService,
        callbacks: Pick<ApiCallbacks, 'onDeletingStart' | 'onDeletingEnd' | 'onError' | 'onDelete'>,
    ): Observable<void | null> {
        callbacks.onDeletingStart();

        return prodigeService.deleteProdige(prodigeId).pipe(
            catchError((error) => {
                console.error('Error deleting prodige:', error);
                callbacks.onError('Failed to delete prodige');
                messageService.add({
                    severity: 'error',
                    summary: translationService.translate('shared.messages.error'),
                    detail: translationService.translate('procrud.messages.deleteError') || 'Failed to delete prodige',
                    life: 3000,
                });
                return of(null);
            }),
            finalize(() => callbacks.onDeletingEnd()),
        );
    }

    /**
     * Saves a prodige (create or update based on whether it has an ID)
     */
    static saveProdige(
        prodige: Prodige,
        prodigeService: ProdigeService,
        userService: UserService,
        translationService: TranslationService,
        messageService: MessageService,
        callbacks: Pick<ApiCallbacks, 'onSavingStart' | 'onSavingEnd' | 'onError' | 'onSuccess'>,
    ): Observable<Prodige | null> {
        if (prodige.id) {
            return this.updateProdige(prodige, prodigeService, translationService, messageService, callbacks);
        } else {
            return this.createProdige(prodige, prodigeService, userService, translationService, messageService, callbacks);
        }
    }
}
