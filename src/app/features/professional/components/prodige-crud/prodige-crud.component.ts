import { Component, OnInit, signal, ViewChild } from '@angular/core';
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

    constructor(
        private prodigeService: ProdigeService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
    ) {}

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.prodigeService.getProdigies().then((data) => {
            this.prodigies.set(data);
        });

        this.sportOptions = this.prodigeService.getSportOptions();
        this.tagOptions = this.prodigeService.getTagOptions();

        this.cols = [
            { field: 'nom', header: 'Nom', customExportHeader: 'Nom du Prodige' },
            { field: 'age', header: 'Âge' },
            { field: 'sport', header: 'Sport' },
            { field: 'videosCount', header: 'Nombre de Vidéos' },
            { field: 'dateCreation', header: 'Date de Création' },
        ];

        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
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
            message: 'Êtes-vous sûr de vouloir supprimer les prodiges sélectionnés ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.prodigies.set(this.prodigies().filter((val) => !this.selectedProdigies?.includes(val)));
                this.selectedProdigies = null;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Prodiges supprimés',
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
            message: 'Êtes-vous sûr de vouloir supprimer ' + prodige.nom + ' ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.prodigies.set(this.prodigies().filter((val) => val.id !== prodige.id));
                this.prodige = {};
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Prodige supprimé',
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
                    summary: 'Limite atteinte',
                    detail: 'Maximum 10 tags autorisés',
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
                    summary: 'Erreur de validation',
                    detail: 'Minimum 3 tags requis',
                    life: 3000,
                });
                return;
            }

            if (this.prodige.tags.length > 10) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur de validation',
                    detail: 'Maximum 10 tags autorisés',
                    life: 3000,
                });
                return;
            }

            // NEW: Validate description for "autre" sport
            if (this.prodige.sport === Sport.Autre && (!this.prodige.description || !this.prodige.description.trim())) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur de validation',
                    detail: 'La description est obligatoire pour le sport "Autre"',
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
                    summary: 'Succès',
                    detail: 'Prodige mis à jour',
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
                    summary: 'Succès',
                    detail: 'Prodige créé',
                    life: 3000,
                });
            }

            this.prodigeDialog = false;
            this.prodige = {};
        }
    }

    // Add a helper method to check if description is required
    isDescriptionRequired(): boolean {
        return this.prodige.sport === Sport.Autre;
    }

    exportCSV() {
        this.dt.exportCSV();
    }
}
