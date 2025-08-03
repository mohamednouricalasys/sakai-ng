// src/app/features/professional/components/messages/messages.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // For ngModel

import { MessageService as AppMessageService } from '../../../../core/services/message.service'; // Aliased
import { Message } from '../../../../core/interfaces/message.interface';
import { MessageService } from 'primeng/api'; // PrimeNG MessageService for toasts

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ListboxModule } from 'primeng/listbox';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-messages',
    standalone: true, // Make it standalone
    imports: [
        CommonModule,
        FormsModule, // For ngModel

        // PrimeNG Modules
        CardModule,
        ListboxModule,
        ButtonModule,
        ToastModule,
    ],
    templateUrl: './messages.component.html',
    styleUrls: ['./messages.component.scss'],
    providers: [MessageService],
})
export class MessagesComponent implements OnInit {
    messages: Message[] = [];
    selectedMessage: Message | null = null;
    displayMessageDetail: boolean = false;

    constructor(
        private appMessageService: AppMessageService, // Your custom service
        private primeNgMessageService: MessageService, // PrimeNG Toast service
    ) {}

    ngOnInit(): void {
        this.loadMessages();
    }

    loadMessages(): void {
        this.appMessageService.getMessages().subscribe({
            next: (data: any[]) => {
                this.messages = data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            },
            error: (error: any) => {
                this.primeNgMessageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load messages.' });
                console.error('Error loading messages:', error);
            },
        });
    }

    onMessageSelect(event: any): void {
        this.selectedMessage = event.value;
        this.displayMessageDetail = true;

        if (this.selectedMessage && !this.selectedMessage.read) {
            this.appMessageService.markMessageAsRead(this.selectedMessage.id).subscribe({
                next: (updatedMsg: any) => {
                    if (updatedMsg) {
                        this.selectedMessage!.read = true; // Use non-null assertion as it's checked above
                        this.primeNgMessageService.add({ severity: 'info', summary: 'Message', detail: 'Message marked as read.' });
                    }
                },
                error: (error: any) => {
                    this.primeNgMessageService.add({ severity: 'error', summary: 'Error', detail: 'Could not mark message as read.' });
                    console.error('Error marking message as read:', error);
                },
            });
        }
    }

    closeMessageDetail(): void {
        this.displayMessageDetail = false;
        this.selectedMessage = null;
    }
}
