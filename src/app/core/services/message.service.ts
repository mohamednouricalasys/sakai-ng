import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Message } from '../interfaces/message.interface';

@Injectable({
    providedIn: 'root',
})
export class MessageService {
    // Mock Data
    private mockMessages: Message[] = [
        { id: 'm1', sender: 'Recruiter A', subject: 'Regarding John Doe', content: 'Lorem ipsum dolor sit amet...', timestamp: new Date(), read: false },
        { id: 'm2', sender: 'Recruiter B', subject: 'New Opportunity', content: 'Consectetur adipiscing elit...', timestamp: new Date(), read: true },
        { id: 'm3', sender: 'Recruiter C', subject: 'Follow up on Jane Smith', content: 'Sed do eiusmod tempor...', timestamp: new Date(), read: false },
    ];

    constructor() {}

    getMessages(): Observable<Message[]> {
        // return this.http.get<Message[]>('/api/messages');
        return of(this.mockMessages);
    }

    getMessageById(id: string): Observable<Message | undefined> {
        // return this.http.get<Message>(`/api/messages/${id}`);
        return of(this.mockMessages.find((msg) => msg.id === id));
    }

    markMessageAsRead(id: string): Observable<Message | undefined> {
        const message = this.mockMessages.find((msg) => msg.id === id);
        if (message) {
            message.read = true;
        }
        // In real API, this would be a PATCH or PUT request
        return of(message);
    }
}
