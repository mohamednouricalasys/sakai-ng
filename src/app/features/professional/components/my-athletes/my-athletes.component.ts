// src/app/features/professional/components/my-athletes/my-athletes.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // For ngModel in dialog

import { Athlete } from '../../../../core/interfaces/athlete.interface';
import { AthleteService } from '../../../../core/services/athlete.service';
import { ConfirmationService, MessageService } from 'primeng/api'; // PrimeNG services

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-my-athletes',
    standalone: true, // Make it standalone
    imports: [
        CommonModule,
        FormsModule, // For two-way data binding in forms

        // PrimeNG Modules
        TableModule,
        ButtonModule,
        DialogModule,
        InputTextModule,
        InputNumberModule,
        ConfirmDialogModule,
        ToastModule,
        ToolbarModule,
        TooltipModule,
    ],
    templateUrl: './my-athletes.component.html',
    styleUrls: ['./my-athletes.component.scss'],
    providers: [ConfirmationService, MessageService],
})
export class MyAthletesComponent implements OnInit {
    athletes: Athlete[] = [];
    selectedAthlete: Athlete | null = null;
    athleteDialogVisible: boolean = false;
    isEditMode: boolean = false;

    constructor(
        private athleteService: AthleteService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService, // PrimeNG Toast service
    ) {}

    ngOnInit(): void {
        this.loadAthletes();
    }

    loadAthletes(): void {
        this.athleteService.getAthletes().subscribe({
            next: (data) => {
                this.athletes = data;
            },
            error: (error) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load athletes.' });
                console.error('Error loading athletes:', error);
            },
        });
    }

    openNewAthleteDialog(): void {
        this.selectedAthlete = { id: '', name: '', sport: '', age: null } as unknown as Athlete;
        this.isEditMode = false;
        this.athleteDialogVisible = true;
    }

    editAthlete(athlete: Athlete): void {
        this.selectedAthlete = { ...athlete };
        this.isEditMode = true;
        this.athleteDialogVisible = true;
    }

    saveAthlete(): void {
        if (this.selectedAthlete) {
            if (this.isEditMode) {
                this.athleteService.updateAthlete(this.selectedAthlete).subscribe({
                    next: (updatedAthlete) => {
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Athlete updated successfully.' });
                        this.loadAthletes();
                        this.athleteDialogVisible = false;
                    },
                    error: (error) => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not update athlete.' });
                        console.error('Error updating athlete:', error);
                    },
                });
            } else {
                const { id, ...newAthleteData } = this.selectedAthlete;
                this.athleteService.addAthlete(newAthleteData).subscribe({
                    next: (addedAthlete) => {
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Athlete added successfully.' });
                        this.loadAthletes();
                        this.athleteDialogVisible = false;
                    },
                    error: (error) => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not add athlete.' });
                        console.error('Error adding athlete:', error);
                    },
                });
            }
        }
    }

    deleteAthlete(athlete: Athlete): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${athlete.name}?`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.athleteService.deleteAthlete(athlete?.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Athlete deleted successfully.' });
                        this.loadAthletes();
                    },
                    error: (error: any) => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not delete athlete.' });
                        console.error('Error deleting athlete:', error);
                    },
                });
            },
        });
    }

    viewAthlete(athlete: Athlete): void {
        this.messageService.add({ severity: 'info', summary: 'View Athlete', detail: `Viewing ${athlete.name}` });
    }
}
