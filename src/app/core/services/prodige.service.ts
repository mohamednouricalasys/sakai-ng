import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Prodige } from '../interfaces/prodige.interface';
import { Sport } from '../enums/sport.enum';
import { Tag } from '../enums/tag.enum';
import { Gender } from '../enums/gender.enum';
import { environment } from '../../../environments/environment';
import { KeycloakService } from 'keycloak-angular';
import { TranslationService } from './translation.service';

@Injectable({
    providedIn: 'root',
})
export class ProdigeService {
    private apiUrl;

    private translationService = inject(TranslationService);

    constructor(
        private http: HttpClient,
        private keycloakService: KeycloakService,
    ) {
        this.apiUrl = environment.apiUrl + '/prodiges'; // Adjust URL as needed
    }

    /**
     * permets de récupérer la liste des agences
     */
    getProdigies(): Observable<Prodige[]> {
        return this.http.get<Prodige[]>(`${this.apiUrl}/all`);
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

    // Updated methods with i18n support
    getTagLabel(tag: Tag): string {
        switch (tag) {
            // Capacités physiques
            case Tag.Vitesse:
                return this.translationService.translate('tags.physical.vitesse');
            case Tag.Endurance:
                return this.translationService.translate('tags.physical.endurance');
            case Tag.Puissance:
                return this.translationService.translate('tags.physical.puissance');
            case Tag.Reflexes:
                return this.translationService.translate('tags.physical.reflexes');
            case Tag.Agilite:
                return this.translationService.translate('tags.physical.agilite');
            case Tag.Explosivite:
                return this.translationService.translate('tags.physical.explosivite');
            case Tag.Souplesse:
                return this.translationService.translate('tags.physical.souplesse');
            case Tag.Coordination:
                return this.translationService.translate('tags.physical.coordination');
            case Tag.Equilibre:
                return this.translationService.translate('tags.physical.equilibre');

            // Capacités techniques
            case Tag.Technique:
                return this.translationService.translate('tags.technical.technique');
            case Tag.MaitriseDuBallon:
                return this.translationService.translate('tags.technical.maitriseDuBallon');
            case Tag.Precision:
                return this.translationService.translate('tags.technical.precision');
            case Tag.Finition:
                return this.translationService.translate('tags.technical.finition');
            case Tag.PasseDecisive:
                return this.translationService.translate('tags.technical.passeDecisive');
            case Tag.TirCadre:
                return this.translationService.translate('tags.technical.tirCadre');
            case Tag.Dribble:
                return this.translationService.translate('tags.technical.dribble');
            case Tag.JeuDeTete:
                return this.translationService.translate('tags.technical.jeuDeTete');
            case Tag.Tacle:
                return this.translationService.translate('tags.technical.tacle');
            case Tag.Interception:
                return this.translationService.translate('tags.technical.interception');
            case Tag.GesteTechnique:
                return this.translationService.translate('tags.technical.gesteTechnique');
            case Tag.Polyvalence:
                return this.translationService.translate('tags.technical.polyvalence');

            // Intelligence et mental
            case Tag.IntelligenceTactique:
                return this.translationService.translate('tags.mental.intelligenceTactique');
            case Tag.LectureDuJeu:
                return this.translationService.translate('tags.mental.lectureDuJeu');
            case Tag.Anticipation:
                return this.translationService.translate('tags.mental.anticipation');
            case Tag.Concentration:
                return this.translationService.translate('tags.mental.concentration');
            case Tag.Mental:
                return this.translationService.translate('tags.mental.mental');
            case Tag.SangFroid:
                return this.translationService.translate('tags.mental.sangFroid');
            case Tag.Maturite:
                return this.translationService.translate('tags.mental.maturite');
            case Tag.GestionDuTemps:
                return this.translationService.translate('tags.mental.gestionDuTemps');
            case Tag.Resilience:
                return this.translationService.translate('tags.mental.resilience');
            case Tag.VisionDeJeu:
                return this.translationService.translate('tags.mental.visionDeJeu');
            case Tag.Decisif:
                return this.translationService.translate('tags.mental.decisif');
            case Tag.PriseDeDecision:
                return this.translationService.translate('tags.mental.priseDeDecision');
            case Tag.Adaptabilite:
                return this.translationService.translate('tags.mental.adaptabilite');
            case Tag.Competiteur:
                return this.translationService.translate('tags.mental.competiteur');
            case Tag.Leadership:
                return this.translationService.translate('tags.mental.leadership');
            case Tag.EspritDEquipe:
                return this.translationService.translate('tags.mental.espritDEquipe');
            case Tag.Determination:
                return this.translationService.translate('tags.mental.determination');
            case Tag.ConfianceEnSoi:
                return this.translationService.translate('tags.mental.confianceEnSoi');
            case Tag.Motivation:
                return this.translationService.translate('tags.mental.motivation');
            case Tag.ApprentissageRapide:
                return this.translationService.translate('tags.mental.apprentissageRapide');
            case Tag.Discipline:
                return this.translationService.translate('tags.mental.discipline');
            case Tag.Regularite:
                return this.translationService.translate('tags.mental.regularite');
            case Tag.EnduranceMentale:
                return this.translationService.translate('tags.mental.enduranceMentale');

            // Comportement et personnalité
            case Tag.Travailleur:
                return this.translationService.translate('tags.behavior.travailleur');
            case Tag.Perseverant:
                return this.translationService.translate('tags.behavior.perseverant');
            case Tag.Passionne:
                return this.translationService.translate('tags.behavior.passionne');
            case Tag.Humilite:
                return this.translationService.translate('tags.behavior.humilite');
            case Tag.Exemplaire:
                return this.translationService.translate('tags.behavior.exemplaire');
            case Tag.Respectueux:
                return this.translationService.translate('tags.behavior.respectueux');
            case Tag.Charismatique:
                return this.translationService.translate('tags.behavior.charismatique');
            case Tag.Dynamique:
                return this.translationService.translate('tags.behavior.dynamique');
            case Tag.Engage:
                return this.translationService.translate('tags.behavior.engage');
            case Tag.FairPlay:
                return this.translationService.translate('tags.behavior.fairPlay');
            case Tag.InfluenceurDeVestiaire:
                return this.translationService.translate('tags.behavior.influenceurDeVestiaire');
            case Tag.AttitudeProfessionnelle:
                return this.translationService.translate('tags.behavior.attitudeProfessionnelle');

            // Créativité et style
            case Tag.Creativite:
                return this.translationService.translate('tags.creativity.creativite');
            case Tag.StyleDeJeuUnique:
                return this.translationService.translate('tags.creativity.styleDeJeuUnique');
            case Tag.Spectaculaire:
                return this.translationService.translate('tags.creativity.spectaculaire');
            case Tag.Showman:
                return this.translationService.translate('tags.creativity.showman');
            case Tag.Imagination:
                return this.translationService.translate('tags.creativity.imagination');

            // Potentiel / projection
            case Tag.GrosPotentiel:
                return this.translationService.translate('tags.potential.grosPotentiel');
            case Tag.EnProgres:
                return this.translationService.translate('tags.potential.enProgres');
            case Tag.JeunePrometteur:
                return this.translationService.translate('tags.potential.jeunePrometteur');
            case Tag.TalentNaturel:
                return this.translationService.translate('tags.potential.talentNaturel');

            default:
                return this.translationService.translate('tags.unknown');
        }
    }

    getSportLabel(sport: Sport): string {
        switch (sport) {
            case Sport.Football:
                return this.translationService.translate('sports.football');
            case Sport.Basketball:
                return this.translationService.translate('sports.basketball');
            case Sport.Rugby:
                return this.translationService.translate('sports.rugby');
            case Sport.Tennis:
                return this.translationService.translate('sports.tennis');
            case Sport.Boxe:
                return this.translationService.translate('sports.boxe');
            case Sport.FootballAmericain:
                return this.translationService.translate('sports.footballAmericain');
            case Sport.HockeySurGlace:
                return this.translationService.translate('sports.hockeySurGlace');
            case Sport.Baseball:
                return this.translationService.translate('sports.baseball');
            case Sport.MMA:
                return this.translationService.translate('sports.mma');
            case Sport.Autre:
                return this.translationService.translate('sports.autre');
            default:
                return this.translationService.translate('sports.unknown');
        }
    }
}
