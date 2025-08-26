// prodige-crud.component.ts

import { Component, inject, OnInit, signal, ViewChild, computed, ChangeDetectorRef } from '@angular/core';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ProdigeService } from '../../../../core/services/prodige.service';
import { Prodige } from '../../../../core/interfaces/prodige.interface';
import { Sport } from '../../../../core/enums/sport.enum';
import { Tag } from '../../../../core/enums/tag.enum';
import { Gender } from '../../../../core/enums/gender.enum';
import { TranslationService } from '../../../../core/services/translation.service';
import { TranslateCountPipe, TranslateParamsPipe, TranslatePipe } from '../../../../core/shared';
import { DataView, DataViewModule } from 'primeng/dataview';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Country } from '../../../../core/interfaces/country.interface';
import { COUNTRIES_DATA } from '../../../../core/shared/countries-data';
import { validateProdige } from './prodige-crud.validation';
import { ProdigeApiHelper, ApiCallbacks } from './prodige-api.helper';
import { ProdigeStore } from './prodige-store';
import { UserService } from '../../../../core/services/user.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-prodige-crud',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        InputTextModule,
        TextareaModule,
        SelectModule,
        InputNumberModule,
        DialogModule,
        TagModule,
        ChipModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        RadioButtonModule,
        TranslatePipe,
        TranslateParamsPipe,
        TranslateCountPipe,
        DataViewModule,
        SelectButtonModule,
    ],
    templateUrl: './prodige-crud.component.html',
    providers: [MessageService, ProdigeService, ConfirmationService, ProdigeStore],
    styles: `
        ::ng-deep {
            .country-flag {
                width: 20px;
                height: 15px;
                margin-right: 8px;
                border-radius: 2px;
            }
        }
    `,
})
export class ProdigeCrudComponent implements OnInit {
    prodigeDialog: boolean = false;

    // Use a store instance for state management
    private readonly store = inject(ProdigeStore);

    // Expose store selectors to the component's template
    readonly prodigies = this.store.prodigies;
    readonly loading = this.store.loading;
    readonly saving = this.store.saving;
    readonly deleting = this.store.deleting;
    readonly error = this.store.error;

    // The current prodige being edited/created
    prodige: Prodige = {};
    submitted: boolean = false;
    sportOptions: any[] = [];
    tagOptions: any[] = [];
    selectedTagToAdd: Tag | null = null;
    sortOptions!: SelectItem[];
    sortOrder!: number;
    sortField!: string;
    countries: Country[] = COUNTRIES_DATA;

    @ViewChild('dv') dv!: DataView;

    private userService = inject(UserService);
    private translationService = inject(TranslationService);
    private prodigeService = inject(ProdigeService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private cdr = inject(ChangeDetectorRef);
    private router = inject(Router);

    // Properties for DataView layout selection
    layout: 'list' | 'grid' = 'list';
    layoutOptions = ['list', 'grid'];

    constructor() {}

    // Helper method for direct translation calls in component logic
    protected t(key: string, params?: Record<string, any>): string {
        return this.translationService.translate(key, params);
    }

    ngOnInit() {
        this.loadData();

        this.sortOptions = [
            { label: this.t('procrud.sort.name.down'), value: '!nom' },
            { label: this.t('procrud.sort.name.up'), value: 'nom' },
        ];

        // Populate the countries array with translated names
        this.countries = COUNTRIES_DATA.map((country) => ({
            ...country,
            name: this.t(`countries.${country.code.toLowerCase()}`),
        }));
    }

    navigateToVideos(prodigeId: string) {
        this.router.navigate(['/professional/videos', prodigeId]);
    }

    onSortChange(event: any) {
        let value = event.value;

        if (value.indexOf('!') === 0) {
            this.sortOrder = -1;
            this.sortField = value.substring(1, value.length);
        } else {
            this.sortOrder = 1;
            this.sortField = value;
        }
    }

    loadData() {
        const callbacks = this.getApiCallbacks();

        ProdigeApiHelper.loadProdigies(this.prodigeService, this.userService, this.translationService, this.messageService, callbacks).subscribe({
            next: (data) => {
                this.store.setProdigies(data);
            },
        });

        this.sportOptions = this.prodigeService.getSportOptions();
        this.tagOptions = this.prodigeService.getTagOptions();
    }

    openNew() {
        this.prodige = { videos: [], tags: [], gender: Gender.Homme, pays: 'FR' };
        this.submitted = false;
        this.selectedTagToAdd = null;
        this.prodigeDialog = true;
    }

    editProdige(prodige: Prodige) {
        this.prodige = {
            ...prodige,
            tags: [...(prodige.tags || [])],
            gender: prodige.gender ?? Gender.Homme,
            pays: prodige.pays || 'FR',
        };
        this.selectedTagToAdd = null;
        this.prodigeDialog = true;
    }

    hideDialog() {
        this.prodigeDialog = false;
        this.submitted = false;
        this.selectedTagToAdd = null;
    }

    deleteProdige(prodige: Prodige) {
        if (!prodige.id) {
            return;
        }

        this.confirmationService.confirm({
            message: this.t('procrud.messages.confirmDeleteProdige', { name: prodige.nom }),
            header: this.t('shared.common.confirmation'),
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const callbacks = this.getApiCallbacks();

                ProdigeApiHelper.deleteProdige(prodige.id!, this.prodigeService, this.translationService, this.messageService, callbacks).subscribe({
                    next: () => {
                        this.store.removeProdige(prodige.id!);
                        this.prodige = {};
                        setTimeout(() => this.dv?.cd?.detectChanges?.(), 0);

                        this.messageService.add({
                            severity: 'success',
                            summary: this.t('shared.common.success'),
                            detail: this.t('procrud.messages.prodigeDeleted'),
                            life: 3000,
                        });
                    },
                });
            },
        });
    }

    getSportLabel(sport: Sport): string {
        return this.prodigeService.getSportLabel(sport);
    }

    getTagLabel(tag: Tag): string {
        return this.prodigeService.getTagLabel(tag);
    }

    getGenderIcon(gender: Gender): string {
        return gender === Gender.Homme ? 'pi pi-mars' : 'pi pi-venus';
    }

    getCountryName(countryCode: string): string {
        const country = this.countries.find((c) => c.code === countryCode);
        return country?.name || countryCode?.toUpperCase() || '';
    }

    addTag() {
        if (this.selectedTagToAdd !== null && this.prodige.tags && !this.prodige.tags.includes(this.selectedTagToAdd)) {
            if (this.prodige.tags.length < 10) {
                this.prodige.tags.push(this.selectedTagToAdd);
                this.selectedTagToAdd = null;
            } else {
                this.messageService.add({
                    severity: 'warn',
                    summary: this.t('shared.messages.limitReached'),
                    detail: this.t('procrud.validation.maxTagsReached'),
                    life: 3000,
                });
            }
        }
    }

    removeTag(tag: Tag) {
        if (this.prodige.tags) {
            this.prodige.tags = this.prodige.tags.filter((t) => t !== tag);
        }
    }

    getAvailableTags(): any[] {
        if (!this.prodige.tags) return this.tagOptions;
        return this.tagOptions.filter((option) => !this.prodige.tags!.includes(option.value));
    }

    getAgeSeverity(age: number): string {
        if (age <= 12) return 'info';
        if (age <= 15) return 'success';
        if (age <= 17) return 'warn';
        return 'danger';
    }

    // Helper method to check if description is required
    isDescriptionRequired(): boolean {
        return this.prodige.sport === Sport.Autre;
    }

    saveProdige() {
        this.submitted = true;

        // Centralized validation
        const validationError = validateProdige(this.prodige);
        if (validationError) {
            this.messageService.add({
                severity: 'error',
                summary: this.t('shared.messages.validationError'),
                detail: this.t(`procrud.validation.${validationError}`) || validationError,
                life: 3000,
            });
            return;
        }

        const callbacks = this.getApiCallbacks();

        ProdigeApiHelper.saveProdige(this.prodige, this.prodigeService, this.userService, this.translationService, this.messageService, callbacks).subscribe({
            next: (savedProdige) => {
                if (savedProdige) {
                    if (this.prodige.id) {
                        this.store.updateProdige(savedProdige);
                    } else {
                        this.store.addProdige(savedProdige);
                    }

                    this.messageService.add({
                        severity: 'success',
                        summary: this.t('shared.common.success'),
                        detail: this.prodige.id ? this.t('procrud.messages.prodigeUpdated') : this.t('procrud.messages.prodigeCreated'),
                        life: 3000,
                    });

                    this.prodigeDialog = false;
                    this.prodige = {};
                    setTimeout(() => this.dv?.cd?.detectChanges?.(), 0);
                }
            },
        });
    }

    getDescriptionPlaceholder(): string {
        return this.isDescriptionRequired() ? this.t('procrud.validation.descriptionRequiredForOther') : this.t('procrud.placeholders.describeQualities');
    }

    getSelectedCountry(): Country | undefined {
        return this.countries.find((c) => c.code === this.prodige.pays);
    }

    // Helper method to force DataView refresh
    refreshDataView() {
        if (this.dv) {
            const currentValue = this.dv.value;
            this.dv.value = [];
            setTimeout(() => {
                this.dv.value = currentValue;
                this.dv.cd?.detectChanges?.();
            }, 0);
        }
    }

    // API callbacks for the helper
    private getApiCallbacks(): ApiCallbacks {
        return {
            onLoadingStart: () => this.store.setLoading(true),
            onLoadingEnd: () => this.store.setLoading(false),
            onSavingStart: () => this.store.setSaving(true),
            onSavingEnd: () => this.store.setSaving(false),
            onDeletingStart: () => this.store.setDeleting(true),
            onDeletingEnd: () => this.store.setDeleting(false),
            onError: (error: string) => this.store.setError(error),
            onSuccess: (prodige: Prodige) => {
                if (this.prodige.id) {
                    this.store.updateProdige(prodige);
                } else {
                    this.store.addProdige(prodige);
                }
                this.cdr.detectChanges();
                setTimeout(() => this.refreshDataView(), 0);
            },
            onDelete: (prodigeId: string) => {
                this.store.removeProdige(prodigeId);
                this.cdr.detectChanges();
                setTimeout(() => this.refreshDataView(), 0);
            },
        };
    }
}
