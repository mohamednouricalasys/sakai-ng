import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Athlete } from '../interfaces/athlete.interface';

@Injectable({
    providedIn: 'root',
})
export class AthleteService {
    // Mock Data
    private mockAthletes: Athlete[] = [
        { id: '1', name: 'John Doe', sport: 'Basketball', age: 22 },
        { id: '2', name: 'Jane Smith', sport: 'Soccer', age: 20 },
        { id: '3', name: 'Mike Johnson', sport: 'Tennis', age: 25 },
    ];

    constructor() {}

    getAthletes(): Observable<Athlete[]> {
        // In a real application, this would be an HttpClient call:
        // return this.http.get<Athlete[]>('/api/athletes');
        return of(this.mockAthletes); // Return mock data as an observable
    }

    addAthlete(athlete: Omit<Athlete, 'id'>): Observable<Athlete> {
        const newAthlete: Athlete = { ...athlete, id: (this.mockAthletes.length + 1).toString() };
        this.mockAthletes.push(newAthlete);
        return of(newAthlete);
        // return this.http.post<Athlete>('/api/athletes', athlete);
    }

    updateAthlete(athlete: Athlete): Observable<Athlete> {
        const index = this.mockAthletes.findIndex((a) => a.id === athlete.id);
        if (index > -1) {
            this.mockAthletes[index] = athlete;
        }
        return of(athlete);
        // return this.http.put<Athlete>(`/api/athletes/${athlete.id}`, athlete);
    }

    deleteAthlete(id: string): Observable<void> {
        this.mockAthletes = this.mockAthletes.filter((athlete) => athlete.id !== id);
        return of(undefined);
        // return this.http.delete<void>(`/api/athletes/${id}`);
    }
}
