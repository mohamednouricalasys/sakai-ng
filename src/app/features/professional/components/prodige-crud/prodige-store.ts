// prodige-store.ts

import { signal, computed, WritableSignal } from '@angular/core';
import { Prodige } from '../../../../core/interfaces/prodige.interface';
import { normalizeProdige } from './prodige-crud.helpers';

// Define the state interface
export interface ProdigeStoreState {
    prodigies: Prodige[];
    loading: boolean;
    saving: boolean;
    deleting: boolean;
    error: string | null;
    lastUpdated: Date | null;
}

// Define the store class
export class ProdigeStore {
    private readonly storeState: WritableSignal<ProdigeStoreState> = signal<ProdigeStoreState>({
        prodigies: [],
        loading: false,
        saving: false,
        deleting: false,
        error: null,
        lastUpdated: null,
    });

    // Computed selectors for reactive state access
    public readonly prodigies = computed(() => this.storeState().prodigies);
    public readonly loading = computed(() => this.storeState().loading);
    public readonly saving = computed(() => this.storeState().saving);
    public readonly deleting = computed(() => this.storeState().deleting);
    public readonly error = computed(() => this.storeState().error);

    /**
     * Updates the store with a partial state object.
     * @param partialState The part of the state to update.
     */
    private updateState(partialState: Partial<ProdigeStoreState>): void {
        this.storeState.update((current) => ({
            ...current,
            ...partialState,
            lastUpdated: new Date(),
        }));
    }

    /**
     * Sets the loading state.
     * @param loading The new loading state.
     */
    public setLoading(loading: boolean): void {
        this.updateState({ loading });
    }

    /**
     * Sets the saving state.
     * @param saving The new saving state.
     */
    public setSaving(saving: boolean): void {
        this.updateState({ saving });
    }

    /**
     * Sets the deleting state.
     * @param deleting The new deleting state.
     */
    public setDeleting(deleting: boolean): void {
        this.updateState({ deleting });
    }

    /**
     * Sets the error state.
     * @param error The new error message.
     */
    public setError(error: string | null): void {
        this.updateState({ error });
    }

    /**
     * Replaces the entire list of prodigies with a new list.
     * @param prodigies The new array of prodigies.
     */
    public setProdigies(prodigies: Prodige[]): void {
        const normalizedProdigies = prodigies.map((prodige) => normalizeProdige(prodige));
        this.updateState({ prodigies: normalizedProdigies, error: null });
    }

    /**
     * Adds a new prodige to the list.
     * @param prodige The prodige to add.
     */
    public addProdige(prodige: Prodige): void {
        const currentProdigies = this.storeState().prodigies;
        const normalizedProdige = normalizeProdige(prodige);
        this.updateState({
            prodigies: [...currentProdigies, normalizedProdige],
            error: null,
        });
    }

    /**
     * Updates an existing prodige in the list.
     * @param updatedProdige The prodige with updated data.
     */
    public updateProdige(updatedProdige: Prodige): void {
        const currentProdigies = this.storeState().prodigies;
        const index = currentProdigies.findIndex((p) => p.id === updatedProdige.id);
        if (index !== -1) {
            const newProdigies = [...currentProdigies];
            newProdigies[index] = normalizeProdige(updatedProdige);
            this.updateState({
                prodigies: newProdigies,
                error: null,
            });
        }
    }

    /**
     * Removes a prodige from the list by its ID.
     * @param prodigeId The ID of the prodige to remove.
     */
    public removeProdige(prodigeId: string): void {
        const currentProdigies = this.storeState().prodigies;
        this.updateState({
            prodigies: currentProdigies.filter((p) => p.id !== prodigeId),
            error: null,
        });
    }
}
