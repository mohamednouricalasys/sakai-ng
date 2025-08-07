import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Prodige } from '../interfaces/prodige.interface';
import { Sport } from '../enums/sport.enum';
import { Tag } from '../enums/tag.enum';
import { Gender } from '../enums/gender.enum';
import { environment } from '../../../environments/environment';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
    providedIn: 'root',
})
export class ProdigeService {
    private apiUrl;

    constructor(
        private http: HttpClient,
        private keycloakService: KeycloakService,
    ) {
        this.apiUrl = environment.apiUrl + '/prodiges'; // Adjust URL as needed
    }

    /**
     * permets de récupérer la liste des agences
     */
    getProdigiess(): Observable<Prodige[]> {
        return this.http.get<Prodige[]>(`${this.apiUrl}/all`);
    }

    getProdigies(): Promise<Prodige[]> {
        //return this.http.get<Prodige[]>(`${this.apiUrl}`);
        // Mock data for demo - replace with actual HTTP call
        return Promise.resolve(this.getMockData());
    }

    getProdigeById(id: string): Observable<Prodige> {
        return this.http.get<Prodige>(`${this.apiUrl}/${id}`);
    }

    createProdige(prodige: Prodige): Observable<Prodige> {
        return this.http.post<Prodige>(this.apiUrl, prodige);
    }

    updateProdige(id: string, prodige: Prodige): Observable<Prodige> {
        return this.http.put<Prodige>(`${this.apiUrl}/${id}`, prodige);
    }

    deleteProdige(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getSportOptions() {
        return Object.keys(Sport)
            .filter((key) => isNaN(Number(key)))
            .map((key) => ({
                label: this.getSportLabel(Sport[key as keyof typeof Sport]),
                value: Sport[key as keyof typeof Sport],
            }));
    }

    getTagOptions() {
        return Object.keys(Tag)
            .filter((key) => isNaN(Number(key)))
            .map((key) => ({
                label: this.getTagLabel(Tag[key as keyof typeof Tag]),
                value: Tag[key as keyof typeof Tag],
            }));
    }

    getTagLabel(tag: Tag): string {
        switch (tag) {
            // Capacités physiques
            case Tag.Vitesse:
                return 'Vitesse';
            case Tag.Endurance:
                return 'Endurance';
            case Tag.Puissance:
                return 'Puissance';
            case Tag.Reflexes:
                return 'Réflexes';
            case Tag.Agilite:
                return 'Agilité';
            case Tag.Explosivite:
                return 'Explosivité';
            case Tag.Souplesse:
                return 'Souplesse';
            case Tag.Coordination:
                return 'Coordination';
            case Tag.Equilibre:
                return 'Équilibre';

            // Capacités techniques
            case Tag.Technique:
                return 'Technique';
            case Tag.MaitriseDuBallon:
                return 'Maîtrise du ballon';
            case Tag.Precision:
                return 'Précision';
            case Tag.Finition:
                return 'Finition';
            case Tag.PasseDecisive:
                return 'Passe décisive';
            case Tag.TirCadre:
                return 'Tir cadré';
            case Tag.Dribble:
                return 'Dribble';
            case Tag.JeuDeTete:
                return 'Jeu de tête';
            case Tag.Tacle:
                return 'Tacle';
            case Tag.Interception:
                return 'Interception';
            case Tag.GesteTechnique:
                return 'Geste technique';
            case Tag.Polyvalence:
                return 'Polyvalence';

            // Intelligence et mental
            case Tag.IntelligenceTactique:
                return 'Intelligence tactique';
            case Tag.LectureDuJeu:
                return 'Lecture du jeu';
            case Tag.Anticipation:
                return 'Anticipation';
            case Tag.Concentration:
                return 'Concentration';
            case Tag.Mental:
                return 'Mental';
            case Tag.SangFroid:
                return 'Sang-froid';
            case Tag.Maturite:
                return 'Maturité';
            case Tag.GestionDuTemps:
                return 'Gestion du temps';
            case Tag.Resilience:
                return 'Résilience';
            case Tag.VisionDeJeu:
                return 'Vision de jeu';
            case Tag.Decisif:
                return 'Décisif';
            case Tag.PriseDeDecision:
                return 'Prise de décision';
            case Tag.Adaptabilite:
                return 'Adaptabilité';
            case Tag.Competiteur:
                return 'Compétiteur';
            case Tag.Leadership:
                return 'Leadership';
            case Tag.EspritDEquipe:
                return "Esprit d'équipe";
            case Tag.Determination:
                return 'Détermination';
            case Tag.ConfianceEnSoi:
                return 'Confiance en soi';
            case Tag.Motivation:
                return 'Motivation';
            case Tag.ApprentissageRapide:
                return 'Apprentissage rapide';
            case Tag.Discipline:
                return 'Discipline';
            case Tag.Regularite:
                return 'Régularité';
            case Tag.EnduranceMentale:
                return 'Endurance mentale';

            // Comportement et personnalité
            case Tag.Travailleur:
                return 'Travailleur';
            case Tag.Perseverant:
                return 'Persévérant';
            case Tag.Passionne:
                return 'Passionné';
            case Tag.Humilite:
                return 'Humilité';
            case Tag.Exemplaire:
                return 'Exemplaire';
            case Tag.Respectueux:
                return 'Respectueux';
            case Tag.Charismatique:
                return 'Charismatique';
            case Tag.Dynamique:
                return 'Dynamique';
            case Tag.Engage:
                return 'Engagé';
            case Tag.FairPlay:
                return 'Fair-play';
            case Tag.InfluenceurDeVestiaire:
                return 'Influenceur de vestiaire';
            case Tag.AttitudeProfessionnelle:
                return 'Attitude professionnelle';

            // Créativité et style
            case Tag.Creativite:
                return 'Créativité';
            case Tag.StyleDeJeuUnique:
                return 'Style de jeu unique';
            case Tag.Spectaculaire:
                return 'Spectaculaire';
            case Tag.Showman:
                return 'Showman';
            case Tag.Imagination:
                return 'Imagination';

            // Potentiel / projection
            case Tag.GrosPotentiel:
                return 'Gros potentiel';
            case Tag.EnProgres:
                return 'En progrès';
            case Tag.JeunePrometteur:
                return 'Jeune prometteur';
            case Tag.TalentNaturel:
                return 'Talent naturel';
        }
    }

    getSportLabel(sport: Sport): string {
        switch (sport) {
            case Sport.Football:
                return 'Football';
            case Sport.Basketball:
                return 'Basketball';
            case Sport.Rugby:
                return 'Rugby';
            case Sport.Tennis:
                return 'Tennis';
            case Sport.Boxe:
                return 'Boxe';
            case Sport.FootballAmericain:
                return 'Football Américain';
            case Sport.HockeySurGlace:
                return 'Hockey sur glace';
            case Sport.Baseball:
                return 'Baseball';
            case Sport.MMA:
                return 'MMA';
            case Sport.Autre:
                return 'Autre';
            default:
                return 'Sport inconnu';
        }
    }

    private getMockData(): Prodige[] {
        return [
            {
                id: '1',
                nom: 'Marie Dubois',
                age: 16,
                sport: Sport.Tennis,
                description: 'Jeune prodige du tennis français avec un revers à deux mains exceptionnel et une grande maturité tactique.',
                tags: [Tag.Technique, Tag.Mental, Tag.Precision, Tag.Competiteur, Tag.JeunePrometteur],
                videos: [
                    { id: '1', titre: 'Entraînement Tennis', url: 'video1.mp4' },
                    { id: '2', titre: 'Match de qualification', url: 'video2.mp4' },
                ],
                dateCreation: new Date('2024-01-15'),
                creePar: 'admin',
                gender: Gender.Femme,
                pays: 'FR',
            },
            {
                id: '2',
                nom: 'Paul Martin',
                age: 14,
                sport: Sport.Football,
                description: 'Attaquant prometteur avec une vitesse exceptionnelle et un excellent sens du but.',
                tags: [Tag.Vitesse, Tag.Finition, Tag.Dribble, Tag.GrosPotentiel, Tag.Passionne],
                videos: [{ id: '3', titre: 'Techniques de dribble', url: 'video3.mp4' }],
                dateCreation: new Date('2024-02-20'),
                creePar: 'admin',
                gender: Gender.Homme,
                pays: 'FR',
            },
            {
                id: '3',
                nom: 'Sophie Leroy',
                age: 15,
                sport: Sport.Basketball,
                description: 'Meneuse de jeu avec une excellente vision et un leadership naturel sur le terrain.',
                tags: [Tag.VisionDeJeu, Tag.Leadership, Tag.IntelligenceTactique, Tag.PasseDecisive],
                videos: [
                    { id: '4', titre: 'Compétition régionale', url: 'video4.mp4' },
                    { id: '5', titre: 'Entraînement technique', url: 'video5.mp4' },
                ],
                dateCreation: new Date('2024-03-10'),
                creePar: 'admin',
                gender: Gender.Femme,
                pays: 'CA',
            },
            {
                id: '4',
                nom: 'Lucas Bernard',
                age: 17,
                sport: Sport.Rugby,
                description: "Pilier avec une puissance physique remarquable et un mental d'acier.",
                tags: [Tag.Puissance, Tag.Mental, Tag.EspritDEquipe, Tag.Determination, Tag.Travailleur, Tag.Resilience],
                videos: [],
                dateCreation: new Date('2024-04-05'),
                creePar: 'admin',
                gender: Gender.Homme,
                pays: 'GB',
            },
            {
                id: '5',
                nom: 'Emma Rousseau',
                age: 13,
                sport: Sport.MMA,
                description: 'Jeune combattante avec des réflexes extraordinaires et une discipline exemplaire.',
                tags: [Tag.Reflexes, Tag.Discipline, Tag.Agilite, Tag.JeunePrometteur, Tag.ApprentissageRapide],
                videos: [{ id: '6', titre: 'Entraînement combat', url: 'video6.mp4' }],
                dateCreation: new Date('2024-05-12'),
                creePar: 'admin',
                gender: Gender.Femme,
                pays: 'US',
            },
        ];
    }
}
