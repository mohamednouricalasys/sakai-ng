import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
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
import { ProdigeService } from '../../../../core/services/prodige.service';
import { Prodige } from '../../../../core/interfaces/prodige.interface';
import { Sport } from '../../../../core/enums/sport.enum';
import { Tag } from '../../../../core/enums/tag.enum';
import { TranslationService } from '../../../../core/services/translation.service';
import { TranslateCountPipe, TranslateParamsPipe, TranslatePipe } from '../../../../core/shared';

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
        CommonModule,
        TableModule,
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
        TranslatePipe,
        TranslateParamsPipe,
        TranslateCountPipe,
    ],
    templateUrl: './prodige-crud.component.html',
    providers: [MessageService, ProdigeService, ConfirmationService],
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

    @ViewChild('dt') dt!: Table;

    exportColumns!: ExportColumn[];

    cols!: Column[];

    private translationService = inject(TranslationService);

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
    }

    loadData() {
        this.prodigeService.getProdigies().then((data) => {
            this.prodigies.set(data);
        });

        this.sportOptions = this.prodigeService.getSportOptions();
        this.tagOptions = this.prodigeService.getTagOptions();

        // Internationalized column definitions
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

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.prodige = { videos: [], tags: [] };
        this.submitted = false;
        this.selectedTagToAdd = null;
        this.prodigeDialog = true;
    }

    editProdige(prodige: Prodige) {
        this.prodige = { ...prodige, tags: [...(prodige.tags || [])] };
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

    saveProdige() {
        this.submitted = true;
        const _prodigies = this.prodigies();

        if (this.prodige.nom?.trim() && this.prodige.age && this.prodige.sport !== undefined) {
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

    // Helper method to check if description is required
    isDescriptionRequired(): boolean {
        return this.prodige.sport === Sport.Autre;
    }

    exportCSV() {
        this.dt.exportCSV();
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
}
