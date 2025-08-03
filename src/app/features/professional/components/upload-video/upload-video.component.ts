// src/app/features/professional/components/upload-video/upload-video.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // For ngModel

import { AthleteService } from '../../../../core/services/athlete.service';
import { Athlete } from '../../../../core/interfaces/athlete.interface';
import { MessageService } from 'primeng/api'; // PrimeNG MessageService for toasts

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-upload-video',
    standalone: true, // Make it standalone
    imports: [
        CommonModule,
        FormsModule, // For ngModel

        // PrimeNG Modules
        CardModule,
        DropdownModule,
        InputTextModule,
        InputTextModule,
        FileUploadModule,
        ToastModule,
    ],
    templateUrl: './upload-video.component.html',
    styleUrls: ['./upload-video.component.scss'],
    providers: [MessageService],
})
export class UploadVideoComponent implements OnInit {
    athletes: Athlete[] = [];
    selectedAthlete: Athlete | null = null;
    videoTitle: string = '';
    videoDescription: string = '';

    constructor(
        private athleteService: AthleteService,
        private messageService: MessageService, // PrimeNG Toast service
    ) {}

    ngOnInit(): void {
        this.athleteService.getAthletes().subscribe({
            next: (data) => {
                this.athletes = data;
            },
            error: (error) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load athletes for selection.' });
                console.error('Error loading athletes:', error);
            },
        });
    }

    onUpload(event: any): void {
        if (!this.selectedAthlete) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select an athlete.' });
            return;
        }
        if (!this.videoTitle.trim()) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Video Title is required.' });
            return;
        }

        const uploadedFiles = event.files;
        console.log('Uploaded files:', uploadedFiles);
        console.log('Selected Athlete:', this.selectedAthlete);
        console.log('Video Title:', this.videoTitle);
        console.log('Video Description:', this.videoDescription);

        setTimeout(() => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: `${uploadedFiles.length} file(s) uploaded successfully for ${this.selectedAthlete?.name}!` });
            this.selectedAthlete = null;
            this.videoTitle = '';
            this.videoDescription = '';
        }, 1000);
    }
}
