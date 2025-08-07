import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
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

// PrimeNG DataView and SelectButton modules
import { DataView, DataViewModule } from 'primeng/dataview';
import { SelectButtonModule } from 'primeng/selectbutton';
import { PickListModule } from 'primeng/picklist';
import { OrderListModule } from 'primeng/orderlist';
import { Country } from '../../../../core/interfaces/country.interface';
import { DropdownModule } from 'primeng/dropdown';
import { COUNTRIES_DATA } from '../../../../core/shared/countries-data';

interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

interface ExportColumn {
    title: string;
    dataKey: string;
}

@Component({
    selector: 'app-prodige-crud',
    standalone: true,
    imports: [
        PickListModule,
        OrderListModule,
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
        DropdownModule,
    ],
    templateUrl: './prodige-crud.component.html',
    providers: [MessageService, ProdigeService, ConfirmationService],
    styles: `
        ::ng-deep {
            .p-orderlist-list-container {
                width: 100%;
            }
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

    prodigies = signal<Prodige[]>([]);

    prodige: Prodige = {};

    selectedProdigies: Prodige[] | null = null;

    submitted: boolean = false;

    sportOptions: any[] = [];

    tagOptions: any[] = [];

    selectedTagToAdd: Tag | null = null;

    sortOptions!: SelectItem[];

    sortOrder!: number;

    sortField!: string;

    // Gender options
    genderOptions = [
        { label: '', value: Gender.Homme },
        { label: '', value: Gender.Femme },
    ];

    countries = COUNTRIES_DATA;

    selectedCountry: Country | null = null;

    // Changed ViewChild from 'dt' (Table) to 'dv' (DataView)
    @ViewChild('dv') dv!: DataView;

    exportColumns!: ExportColumn[];

    cols!: Column[];

    private translationService = inject(TranslationService);

    // Properties for DataView layout selection
    layout: 'list' | 'grid' = 'list';
    layoutOptions = ['list', 'grid'];

    constructor(
        private prodigeService: ProdigeService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
    ) {}

    // Helper method for direct translation calls in component logic
    protected t(key: string, params?: Record<string, any>): string {
        return this.translationService.translate(key, params);
    }

    // Helper for count translations
    protected translateCount(key: string, count: number): string {
        return this.translationService.translateWithCount(key, count);
    }

    ngOnInit() {
        this.loadData();

        this.sortOptions = [
            { label: this.t('procrud.sort.name.down'), value: '!nom' },
            { label: this.t('procrud.sort.name.up'), value: 'nom' },
        ];

        // Initialize gender options after translation service is available
        this.genderOptions = [
            { label: this.t('shared.common.male'), value: Gender.Homme },
            { label: this.t('shared.common.female'), value: Gender.Femme },
        ];

        // Populate the countries array with translated names
        this.countries = COUNTRIES_DATA.map((country) => ({
            ...country,
            name: this.t(`countries.${country.code.toLowerCase()}`),
        }));
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
        this.prodigeService.getProdigiess().subscribe((data) => console.log('data : ', data));

        this.prodigeService.getProdigies().then((data) => {
            this.prodigies.set(data);
        });

        this.sportOptions = this.prodigeService.getSportOptions();
        this.tagOptions = this.prodigeService.getTagOptions();

        // Internationalized column definitions (kept for potential CSV export, though not directly used by DataView rendering)
        this.cols = [
            {
                field: 'nom',
                header: this.t('procrud.columns.nom'),
                customExportHeader: this.t('procrud.columns.nomExport'),
            },
            {
                field: 'age',
                header: this.t('procrud.columns.age'),
            },
            {
                field: 'sport',
                header: this.t('procrud.columns.sport'),
            },
            {
                field: 'gender',
                header: this.t('procrud.columns.gender'),
            },
            {
                field: 'pays',
                header: this.t('procrud.columns.country'),
            },
            {
                field: 'videosCount',
                header: this.t('procrud.columns.videosCount'),
            },
            {
                field: 'dateCreation',
                header: this.t('procrud.columns.dateCreation'),
            },
        ];

        this.exportColumns = this.cols.map((col) => ({
            title: col.header,
            dataKey: col.field,
        }));
    }

    // Updated onGlobalFilter method to use DataView's filter API
    onGlobalFilter(dataview: DataView, event: Event) {
        dataview.filter((event.target as HTMLInputElement).value);
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

    deleteSelectedProdigies() {
        this.confirmationService.confirm({
            message: this.t('procrud.messages.confirmDeleteProdigies'),
            header: this.t('shared.common.confirmation'),
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.prodigies.set(this.prodigies().filter((val) => !this.selectedProdigies?.includes(val)));
                this.selectedProdigies = null;
                this.messageService.add({
                    severity: 'success',
                    summary: this.t('shared.common.success'),
                    detail: this.t('procrud.messages.prodigiesDeleted'),
                    life: 3000,
                });
            },
        });
    }

    hideDialog() {
        this.prodigeDialog = false;
        this.submitted = false;
        this.selectedTagToAdd = null;
    }

    deleteProdige(prodige: Prodige) {
        this.confirmationService.confirm({
            message: this.t('procrud.messages.confirmDeleteProdige', { name: prodige.nom }),
            header: this.t('shared.common.confirmation'),
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.prodigies.set(this.prodigies().filter((val) => val.id !== prodige.id));
                this.prodige = {};
                this.messageService.add({
                    severity: 'success',
                    summary: this.t('shared.common.success'),
                    detail: this.t('procrud.messages.prodigeDeleted'),
                    life: 3000,
                });
            },
        });
    }

    findIndexById(id: string): number {
        let index = -1;
        for (let i = 0; i < this.prodigies().length; i++) {
            if (this.prodigies()[i].id === id) {
                index = i;
                break;
            }
        }
        return index;
    }

    createId(): string {
        let id = '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 8; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }

    getSportLabel(sport: Sport): string {
        return this.prodigeService.getSportLabel(sport);
    }

    getTagLabel(tag: Tag): string {
        return this.prodigeService.getTagLabel(tag);
    }

    getGenderLabel(gender: Gender): string {
        return gender === Gender.Homme ? this.t('shared.common.male') : this.t('shared.common.female');
    }

    getGenderIcon(gender: Gender): string {
        return gender === Gender.Homme ? 'pi pi-mars' : 'pi pi-venus';
    }

    getCountryName(countryCode: string): string {
        // You might want to use a proper country name mapping service
        // For now, return the country code
        return countryCode?.toUpperCase() || '';
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

    getVideosCountSeverity(count: number): string {
        if (count === 0) return 'danger';
        if (count <= 2) return 'warn';
        return 'success';
    }

    // Helper method to check if description is required
    isDescriptionRequired(): boolean {
        return this.prodige.sport === Sport.Autre;
    }

    saveProdige() {
        this.submitted = true;
        const _prodigies = this.prodigies();

        if (this.prodige.nom?.trim() && this.prodige.age && this.prodige.sport !== undefined && this.prodige.gender !== undefined) {
            // Validate tags
            if (!this.prodige.tags || this.prodige.tags.length < 3) {
                this.messageService.add({
                    severity: 'error',
                    summary: this.t('shared.messages.validationError'),
                    detail: this.t('procrud.validation.minTagsRequired'),
                    life: 3000,
                });
                return;
            }

            if (this.prodige.tags.length > 10) {
                this.messageService.add({
                    severity: 'error',
                    summary: this.t('shared.messages.validationError'),
                    detail: this.t('procrud.validation.maxTagsReached'),
                    life: 3000,
                });
                return;
            }

            // Validate description for "autre" sport
            if (this.prodige.sport === Sport.Autre && (!this.prodige.description || !this.prodige.description.trim())) {
                this.messageService.add({
                    severity: 'error',
                    summary: this.t('shared.messages.validationError'),
                    detail: this.t('procrud.validation.descriptionRequired'),
                    life: 3000,
                });
                return;
            }

            if (this.prodige.id) {
                // Update existing prodige
                _prodigies[this.findIndexById(this.prodige.id)] = this.prodige;
                this.prodigies.set([..._prodigies]);
                this.messageService.add({
                    severity: 'success',
                    summary: this.t('shared.common.success'),
                    detail: this.t('procrud.messages.prodigeUpdated'),
                    life: 3000,
                });
            } else {
                // Create new prodige
                this.prodige.id = this.createId();
                this.prodige.dateCreation = new Date();
                this.prodige.creePar = 'current-user'; // Replace with actual user
                this.prodigies.set([..._prodigies, this.prodige]);
                this.messageService.add({
                    severity: 'success',
                    summary: this.t('shared.common.success'),
                    detail: this.t('procrud.messages.prodigeCreated'),
                    life: 3000,
                });
            }

            this.prodigeDialog = false;
            this.prodige = {};
        }
    }

    // The exportCSV method needs to be adapted as DataView does not have a direct exportCSV() method like Table.
    // You would typically implement custom CSV export logic here based on your `prodigies` data.
    exportCSV() {
        // Example of how you might implement a basic CSV export for DataView data:
        const data = this.prodigies();
        if (!data || data.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: this.t('shared.messages.noData'),
                detail: this.t('procrud.messages.noDataToExport'),
                life: 3000,
            });
            return;
        }

        const headers = this.exportColumns.map((col) => col.title).join(',');
        const rows = data.map((prodige) => {
            return this.exportColumns
                .map((col) => {
                    let value = prodige[col.dataKey as keyof Prodige];
                    if (col.dataKey === 'sport') {
                        value = this.getSportLabel(value as Sport);
                    } else if (col.dataKey === 'gender') {
                        value = this.getGenderLabel(value as Gender);
                    } else if (col.dataKey === 'pays') {
                        value = this.getCountryName(value as string);
                    } else if (col.dataKey === 'dateCreation') {
                        value = (value as Date)?.toLocaleDateString('en-GB'); // Format date for CSV
                    } else if (col.dataKey === 'tags') {
                        value = (value as Tag[])?.map((tag) => this.getTagLabel(tag)).join(';');
                    } else if (col.dataKey === 'videosCount') {
                        value = (prodige.videos?.length || 0).toString();
                    }
                    return `"${value !== undefined && value !== null ? String(value).replace(/"/g, '""') : ''}"`;
                })
                .join(',');
        });

        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'prodigies.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            this.messageService.add({
                severity: 'error',
                summary: this.t('shared.common.error'),
                detail: this.t('procrud.messages.exportNotSupported'),
                life: 3000,
            });
        }
    }

    // Additional helper methods for template usage
    getTagCountText(): string {
        const count = this.prodige.tags?.length || 0;
        return this.t('procrud.tags.selectedCount', { count });
    }

    getVideoCountText(): string {
        const count = this.prodige.videos?.length || 0;
        return this.t('procrud.tags.associatedVideosCount', { count });
    }

    getDescriptionPlaceholder(): string {
        return this.isDescriptionRequired() ? this.t('procrud.validation.descriptionRequiredForOther') : this.t('procrud.placeholders.describeQualities');
    }

    getAgeLabel(age: number): string {
        return `${age} ${this.t('shared.common.years')}`;
    }

    getPaginationTemplate(): string {
        return this.t('procrud.pagination.showing');
    }

    getSelectedCountry(): Country | undefined {
        return this.countries.find((c) => c.code === this.prodige.pays);
    }
}
