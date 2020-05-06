import {Card} from '../enums/Card';
import {Etats} from '../server/Jeu';

export interface IData {
    nomJoueurs: string[]; // noms de tous les joueurs
    joueurs: number; // nombre de joueurs
    premierTourDe: number | null;
    cartes: Card[];
    cartesJoueurs: Card[][]; // table de toutes les cartes de tous les joueurs
    //chien: Card[];
    pli: Card[];
    pioche: Card[];
    //pliFait: Card[][]; // par joueur
    etat: Etats;
    chat: string;
    tourDe: number;
    coupDe: number | null;
    //reponsePrisePasse: number;
    //preneur: number | null;
    //roiAppele: Card | null;
    //joueurAvecRoi: number | null;
    //dernierpli: Card[];
    //excuseDe: number | null;
    //excusepliFaitPar: number | null;
    resultat: number | null;
    pointsNecessaire: number | null;
    //preneurAGagne: boolean | null;
    sensHoraire: boolean;
    joueurGagnant: number | null;
    couleurMaitrePile: string | null;
    valeurMaitrePile: string | null;
    cartesRestantesAPiocher: number;
}
