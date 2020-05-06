import {connection} from 'websocket';
import {TarotCartes} from '../datastructure/cartes';
import {Card} from '../enums/Card';
//import {CardColor} from '../enums/CardColor';
//import {CardType} from '../enums/CardType';
import {IData} from '../interfaces/IData';


export enum Etats {
    PAS_DE_JEU = 'pasDeJeu',
    COUPER = 'Couper',
    DISTRIBUER = 'Distribuer',
    CONSTITUER_PIOCHE = 'Constituer pioche',
    //APPELER_ROI = 'AppelerRoi',
    //CHIEN_MONTREE = 'chienMontree',
    //FAIRE_JEU = 'faireJeu',
    //QUI_PREND = 'QuiPrend',
    MONTRE_CARTES = 'montreCartes',
    JEU = 'Jeu',
    FINI = 'Fini',
    CHOIX_COULEUR = 'choisir couleur', 
}

export default class Jeu {
    public static couleurs: { [couleur: string]: number } = {R: 0, J: 1, V: 2, B: 3, M: 4};
    public static cartesType: { [type: string]: number } = {
        0: 0,
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 8,
        9: 9,
        t: 10,
        c: 11,
        p2: 12,
        p4: 13,
        j: 14,
    };
    

    public static creeNouveauJeu(nomJoueurs: string[]): Jeu {
        const cartes = [...TarotCartes];
        shuffle(cartes);
        const premierTourDe = Math.floor(Math.random() * nomJoueurs.length);
        const data: IData = {
            cartes,
            cartesJoueurs: [],
            chat: '',
            //chien: [],
            coupDe: null,
            //dernierpli: [],
            etat: Etats.FINI,
            //excuseDe: null,
            //excusePliFaitPar: null,
            //joueurAvecRoi: null,
            joueurs: nomJoueurs.length,
            nomJoueurs,
            pli: [],
            pioche: [],
            //pliFait: [],
            pointsNecessaire: null,
            premierTourDe,
            //preneur: null,
            //preneurAGagne: null,
            //reponsePrisePasse: 0,
            resultat: null,
            //roiAppele: null,
            tourDe: premierTourDe,
            sensHoraire: true,
            joueurGagnant: null,
            couleurMaitrePile: null,
            valeurMaitrePile: null,
            cartesRestantesAPiocher: 1,
        };
        const jeu = new Jeu(data, []);
        jeu.prochainJeu();
        return jeu;
    }

/*     private static ordreCartes(a: Card, b: Card) {
        if (a === '--' && b === '--') {
            return 0;
        }
        if (a === '--' || a === 'J') {
            return -1;
        } else if (b === '--' || b === 'J') {
            return 1;
        }

        const couleurA = a.substring(0, 1);
        const couleurB = b.substring(0, 1);
        if (couleurA !== couleurB) {
            return Jeu.couleurs[couleurA] - Jeu.couleurs[couleurB];
        } else if (couleurA === 'A') {
            return parseInt(a.substring(1), 10) - parseInt(b.substring(1), 10);
        } else {
            return Jeu.cartesType[a.substring(1)] - Jeu.cartesType[b.substring(1)];
        }
    } */

    private static cartePermis(carte: Card, pli: Card[], cartes: Card[], couleurMaitre: string, valeurMaitre: string) {
        //let couleurMaitre: CardColor | null = null;
        //let valeurMaitre: CardType | null = null;
        //couleurMaitre = pli[pli.length-1].substring(0,1); // TODO: prendre couleurmaitre2 et valeurmaitre2 de IData (ne pas oublier de mettre à jour couleurmaitre2 et valeurmaitre2 avec leurs nouvelles valeurs)
        //valeurMaitre = pli[pli.length-1].substring(1);


        if (couleurMaitre === null || valeurMaitre === null) {
            return true;
        }

        const carteCouleur = carte.substring(0, 1);
        const carteValeur = carte.substring(1);
        //console.log('couleurMaitre:'+couleurMaitre+'  valeurMaitre:'+valeurMaitre);
        // for now, simple logic (improve later): 
        // if you have the matching color RBJV, you can play (the matching color or M)
        // if you have the matching type 0-9, p2, t, c, p4, j, you can play
        // if the mastercolor is M, you can play every color and type
        
        //pas de superposition de p2
        if (valeurMaitre === 'p2'){
            return false;
        }

        // si la couleur precedente est R,B,J ou V:
        if (couleurMaitre === 'R' || couleurMaitre ==='B' || couleurMaitre === 'J' || couleurMaitre ==='V'){
            if (carteCouleur === couleurMaitre || carteCouleur === 'M') {
                return true;
            }
        }
        // si la couleur maitre est M, toutes les couleurs sont jouables
        //if (couleurMaitre ==='M') {
        //    return true;
        //}
        // si les valeurs sont les memes (superposition de p4 autorisee)
        if (carteValeur === valeurMaitre){
            return true;
        } 
        
    return false;
    }

    /* private static quiGagnePli(pli: Card[]) {
        let pliPour = 0;
        let carteHaute: Card | null = null;
        pli.forEach((c, i) => {
            const couleur = c.substring(0, 1);
            if (couleur !== 'J') {
                if (carteHaute == null) {
                    carteHaute = c;
                    pliPour = i;
                } else {
                    if (carteHaute.substring(0, 1) === 'A') {
                        if (c.substring(0, 1) === 'A') {
                            const atout = parseInt(c.substring(1), 10);
                            const atoutHaute = parseInt(carteHaute.substring(1), 10);
                            if (atout > atoutHaute) {
                                carteHaute = c;
                                pliPour = i;
                            }
                        }
                    } else {
                        if (c.substring(0, 1) === 'A') {
                            carteHaute = c;
                            pliPour = i;
                        } else if (c.substring(0, 1) === carteHaute.substring(0, 1)) {
                            if (Jeu.cartesType[c.substring(1)] > Jeu.cartesType[carteHaute.substring(1)]) {
                                carteHaute = c;
                                pliPour = i;
                            }
                        }
                    }
                }
            }
        });
        return pliPour;
    } */

    private static compteCartes(cartes: Card[]) {
        if (cartes!==null){
            return cartes.reduce((count, c) => count + Jeu.pointsCarte(c), 0);
        } else return 0;
    }

    private static pointsCarte(carte: Card) {
        const couleur = carte.substring(0, 1);
        const type = carte.substring(1);
        if (carte === null) {
            return 0;
        }
        if (carte === 'Mj' || carte === 'Mp4') {
            return 50;
        }
        else if (couleur !== 'M') {
            if (type === 'p2' || type === 'c' || type === 't') {
                return 20;
            } else {
                return Number(type);
            }
        }
        else { return 0}
    }

    /* private static pointsNecessaire(cartes: Card[]) {
        const points = [56, 51, 41, 31];
        const bouts = cartes.reduce((count, c) => {
            switch (c) {
                case 'A1':
                    return count + 1;
                case 'A21':
                    return count + 1;
                case 'J':
                    return count + 1;
                default:
                    return count;
            }
        }, 0);
        return points[bouts];
    } */

    public connections: connection[] = [];

    public invalid = false;

    constructor(public data: IData, public guids: string[]) {
    }

    public prochainJeu() {
        if (this.data.etat !== Etats.FINI) {
            return;
        }
        this.data.etat = Etats.COUPER;
        //this.data.premierTourDe = (this.data.premierTourDe + 1) % this.data.joueurs;
        this.data.premierTourDe=Math.floor(Math.random() * this.data.nomJoueurs.length);
        this.data.tourDe = this.data.premierTourDe;
        this.data.coupDe = (this.data.tourDe + this.data.joueurs - 2) % this.data.joueurs;
        //this.data.reponsePrisePasse = 0;

        //this.data.cartes = this.data.cartes.concat(this.data.chien, ...this.data.cartesJoueurs, ...this.data.pliFait);
        this.data.cartes = this.data.cartes.concat(...this.data.cartesJoueurs);
        //this.data.chien = [];

        for (let i = 0; i < this.data.joueurs; i++) {
            this.data.cartesJoueurs[i] = [];
            //this.data.pliFait[i] = [];
        }

        //this.data.preneur = null;
        //this.data.roiAppele = null;
        //this.data.joueurAvecRoi = null;
        this.data.pli = [];
        //this.data.dernierpli = [];
        //this.data.excuseDe = null;
        //this.data.excusepileFaitPar = null;
        this.data.resultat = null;
        this.data.pointsNecessaire = null;
        //this.data.preneurAGagne = null;
        this.data.couleurMaitrePile = null;
        this.data.valeurMaitrePile = null;
        this.data.cartesRestantesAPiocher = 1;
    }

    public coupe(nombre: number) {
        this.data.cartes = this.data.cartes.slice(nombre).concat(this.data.cartes.slice(0, nombre));
        this.data.coupDe = 0;
        this.data.etat = Etats.DISTRIBUER;
        console.log('Nombre total de cartes avant distribution '+this.data.cartes.length);
    }

    /* public jePrendsPasse(qui: number, prends: boolean, callback: () => void) {
        if (this.data.etat !== Etats.QUI_PREND || qui !== this.data.tourDe) {
            // TODO error
            return;
        }
        if (prends) {
            this.data.preneur = qui;
        }
        this.data.reponsePrisePasse += 1;
        if (this.data.reponsePrisePasse === this.data.joueurs) {
            if (this.data.preneur == null) {
                this.data.etat = Etats.FINI;
                this.prochainJeu();
                callback();
                return;
            } else {
                this.data.cartesJoueurs.forEach(cartes => cartes.sort(Jeu.ordreCartes));
                if (this.data.joueurs === 5) {
                    this.data.etat = Etats.APPELER_ROI;
                } else {
                    this.montreChien(callback);
                }
            }
        }
        this.data.tourDe = (this.data.tourDe + 1) % this.data.joueurs;
        callback();
    } */

    /* public montreChien(callback: () => void) {
        this.data.etat = Etats.CHIEN_MONTREE;
        setTimeout(() => {
            if (this.data.preneur === null) {
                console.warn('MontreChien error: Preneur is not set');
                return;
            }
            this.data.cartesJoueurs[this.data.preneur] = this.data.cartesJoueurs[this.data.preneur].concat(
                this.data.chien);
            this.data.cartesJoueurs[this.data.preneur].sort(Jeu.ordreCartes);
            this.data.chien = [];
            this.data.etat = Etats.FAIRE_JEU;
            callback();
        }, 7000);
    } */

    public carteClick(qui: number, carte: Card, callback: () => void) {
        if (this.data.etat === Etats.JEU) {
            this.joueCarte(qui, carte, callback);
        }
        callback();
    }

    /* public faireJeu(qui: number, carte: Card) {
        if (this.data.etat !== Etats.FAIRE_JEU || qui !== this.data.preneur) {
            // TODO error
            return;
        }
        if (carte.substring(0, 1) === 'A' || carte.substring(1) === 'R') {
            // TODO what does this check do?
            return;
        }
        const dansCarte = this.data.cartesJoueurs[qui].findIndex(c => c === carte);
        if (dansCarte !== -1) {
            this.data.cartesJoueurs[qui].splice(dansCarte, 1);
            this.data.pli.push(carte);
        } else {
            const dansEcart = this.data.pli.findIndex(c => c === carte);
            if (dansEcart !== -1) {
                this.data.pli.splice(dansEcart, 1);
                this.data.cartesJoueurs[qui].push(carte);
                this.data.cartesJoueurs[qui].sort(Jeu.ordreCartes);
            }
        }
    } */

    /* public finiFaireJeu(qui: number) {
        if (this.data.etat !== Etats.FAIRE_JEU ||
            qui !== this.data.preneur ||
            this.data.pli.length !== Jeu.nombrePourChien(this.data.joueurs)) {
            // TODO error
            return;
        }
        this.data.pliFait[qui] = this.data.pli;
        this.data.pli = [];

        this.data.etat = Etats.JEU;
    }
 */
    public joueCarte(qui: number, carte: Card, callback: () => void) {
        if (this.data.etat !== Etats.JEU || qui !== this.data.tourDe) {
            // TODO error
            return;
        }

        // put premierTourDe to null after premierTour is done
        if (this.data.premierTourDe !== null) {
            this.data.premierTourDe = null;
        }

        const carteIndex = this.data.cartesJoueurs[qui].findIndex(c => c === carte);
        if (carteIndex === -1) {
            // TODO error
            return;
        }

        if (this.data.couleurMaitrePile===null || this.data.valeurMaitrePile===null){
            return;
        }

        if (!Jeu.cartePermis(carte, this.data.pli, this.data.cartesJoueurs[qui], this.data.couleurMaitrePile, this.data.valeurMaitrePile)) {
            // TODO error
            return;
        }

        this.data.cartesJoueurs[qui].splice(carteIndex, 1); // enleve la carte de la main du joueur
        this.data.pli.push(carte); // met cette carte dans la pile
        this.data.couleurMaitrePile = this.data.pli[this.data.pli.length-1].substring(0,1); // update couleurMaitre
        this.data.valeurMaitrePile = this.data.pli[this.data.pli.length-1].substring(1); // update valeurMaitre


        // si la dernière carte du joueur est posée, le joueur est gagnant
        if (this.data.cartesJoueurs[qui].length === 0) {
            console.log('Jeu terminé! Calcul du résultat...');
            this.data.joueurGagnant = qui;
            var pointsJoueurs = new Array<number>();
            this.data.resultat = 0;
            for (let j = 0; j < this.data.joueurs; j++) {
                let cartesJoueurs = this.data.cartesJoueurs[j];
                pointsJoueurs[j] = Jeu.compteCartes(cartesJoueurs);
                this.data.resultat = this.data.resultat + pointsJoueurs[j];
                console.log('le résultat est: ' + this.data.resultat);
            }
            // si la derniere carte est un p2
            if (carte.substring(1)==='p2'){
                this.data.resultat = this.data.resultat + Jeu.compteCartes([this.data.pioche[this.data.pioche.length-1],this.data.pioche[this.data.pioche.length-2]]);
            }
            // si la derniere carte est un p4
            if (carte.substring(1)==='p4'){
                this.data.resultat = this.data.resultat + Jeu.compteCartes([this.data.pioche[this.data.pioche.length-1], 
                    this.data.pioche[this.data.pioche.length-2],
                    this.data.pioche[this.data.pioche.length-3],
                    this.data.pioche[this.data.pioche.length-4]
                ]);
            }
            this.data.etat = Etats.FINI;
        }

        // si un p4 ou joker est posé, demander la couleur à jouer
        console.log('tourDe: ' + this.data.nomJoueurs[this.data.tourDe]);
        if (this.data.premierTourDe !== null) {
            console.log('premier tourDe: ' + this.data.nomJoueurs[this.data.premierTourDe]);
        }
        if (carte.substring(0, 1) === 'M' && this.data.premierTourDe !== this.data.tourDe) {
            this.data.etat = Etats.CHOIX_COULEUR;
        }
        if (carte.substring(1)==='p4') {
            this.data.cartesRestantesAPiocher = 4;
        }

        // si changement de sens est posé
        if (carte.substring(1)==='c' && this.data.etat===Etats.JEU) {
            if (this.data.sensHoraire === true){
                this.data.sensHoraire = false;
                console.log('changement de sens, le sens est maintenant: ' + this.data.sensHoraire);
            } else {
                this.data.sensHoraire = true;
            }
        }

        // si un passe ton tour est posé
        if (carte.substring(1)==='t' && this.data.etat===Etats.JEU){
            if (this.data.sensHoraire === true){
                this.data.tourDe = (this.data.tourDe + 1) % this.data.joueurs;
            } else {
                this.data.tourDe = (this.data.joueurs + this.data.tourDe - 1) % this.data.joueurs;
            }
        }

        // si un p2 est posé
        if (carte.substring(1)==='p2') {
            this.data.cartesRestantesAPiocher = 2;
        }


        // pour toutes les autres cartes posées, decider à qui de jouer
        if (this.data.sensHoraire === true && this.data.etat===Etats.JEU){
            this.data.tourDe = (this.data.joueurs + this.data.tourDe + 1) % this.data.joueurs;
        } else if (this.data.sensHoraire === false && this.data.etat===Etats.JEU){
            this.data.tourDe = (this.data.joueurs + this.data.tourDe -1) % this.data.joueurs;
        } else {
            return
        }

        // remettre le nombre de cartes restantes à piocher à 1 si un p2 un p4 n'a pas été posé au tour précédent
        if (this.data.valeurMaitrePile !=='p2' && this.data.valeurMaitrePile !== 'p4'){
            this.data.cartesRestantesAPiocher = 1;
        }
        

        // si un p2 est posé
        /* if (carte.substring(1)==='p2') {
            console.log('la pioche: '+ this.data.pioche);
            console.log('carte piochée avant p2: ' + this.data.pioche[this.data.pioche.length-1] + '; with index: ' + (this.data.pioche.length-1));
            this.piocheCarte((this.data.tourDe), this.data.pioche[this.data.pioche.length-1], callback);
            console.log('carte 1 piochée après p2: ' + this.data.pioche[this.data.pioche.length-1] + '; with index: ' + (this.data.pioche.length-1));
            this.piocheCarte((this.data.tourDe), this.data.pioche[this.data.pioche.length-1], callback);
            console.log('carte 2 piochée après p2: ' + this.data.pioche[this.data.pioche.length-1] + '; with index: ' + (this.data.pioche.length-1));
        } */

        // si un p4 est posé
        /* if (carte.substring(0)==='Mp4') {
            this.piocheCarte((this.data.tourDe), this.data.pioche[this.data.pioche.length-1], callback);
            this.piocheCarte((this.data.tourDe), this.data.pioche[this.data.pioche.length-1], callback);
            this.piocheCarte((this.data.tourDe), this.data.pioche[this.data.pioche.length-1], callback);
            this.piocheCarte((this.data.tourDe), this.data.pioche[this.data.pioche.length-1], callback);
        } */


        /* if (this.data.pli.length === this.data.joueurs) {
            this.data.etat = Etats.MONTRE_CARTES;
            setTimeout(() => {
                this.data.dernierpli = this.data.pli.slice();
                this.data.etat = Etats.JEU; */

                //const pourQui = (this.data.tourDe + Jeu.quiGagnePli(this.data.pli)) % this.data.joueurs;
/*                 const excuseIndex = this.data.pile.findIndex(c => c === 'J');
                if (excuseIndex !== -1) {
                    //const excuseDe = (this.data.tourDe + excuseIndex) % this.data.joueurs;
                    //const pourPreneur = pourQui === this.data.preneur || pourQui === this.data.joueurAvecRoi;
                    //const exceuseDePreneur = excuseDe === this.data.preneur || excuseDe === this.data.joueurAvecRoi;
                    if (pourPreneur !== exceuseDePreneur) {
                        this.data.pliFait[excuseDe] = this.data.pliFait[excuseDe].concat(
                            this.data.pli.splice(excuseIndex, 1));
                        this.data.excuseDe = excuseDe;
                        this.data.excusePliFaitPar = pourQui;
                    }
                    this.essayDonnerCartePourExcuse();
                } */

/*                 this.data.pliFait[pourQui] = this.data.pliFait[pourQui].concat(this.data.pli);
                this.data.pli = [];
                this.data.tourDe = pourQui; */

/*                 this.essayDonnerCartePourExcuse();
 */
                // if (this.data.cartesJoueurs[0].length === 0 && this.data.preneur !== null) {
                //if (this.data.cartesJoueurs[0].length === 0) {
                //    this.data.etat = Etats.FINI;
                    //this.data.resultat = this.data.pliFait.map(pli => Jeu.compteCartes(pli));
                    //const cartesPreneur = this.data.joueurAvecRoi === null ?
                    //   this.data.pliFait[this.data.preneur] :
                    //    this.data.pliFait[this.data.preneur].concat(this.data.pliFait[this.data.joueurAvecRoi]);
                    //this.data.pointsNecessaire = Jeu.pointsNecessaire(cartesPreneur);
                    //this.data.preneurAGagne = Jeu.compteCartes(cartesPreneur) > this.data.pointsNecessaire;
                //}
                //callback();
            //}, 3000);
        //}
    }


    public choixCouleur(couleur: string, callback: () => void){
        if (this.data.etat !== Etats.CHOIX_COULEUR) {
            return
        }
        if (couleur !==null) {
            this.data.couleurMaitrePile = couleur;
            callback();
        }
        if (this.data.couleurMaitrePile !== 'M') {
            this.data.etat = Etats.JEU;
            console.log("l'état du jeu est maintennant: " + this.data.etat);
            if (this.data.sensHoraire === true){
                this.data.tourDe = (this.data.joueurs + this.data.tourDe + 1) % this.data.joueurs;
            } else if (this.data.sensHoraire === false){
                this.data.tourDe = (this.data.joueurs + this.data.tourDe -1) % this.data.joueurs;
            }
            callback();
        }
    };

    public piocheCarte(qui: number, carte: Card, callback: () => void) {
        if (this.data.etat !== Etats.JEU || qui !== this.data.tourDe) {
            console.warn('jeu pas commencé ou pas ton tour!');
            return;
        }
        // si la pioche est presque vide
        if (this.data.pioche.length < 5){
            console.log('Reconstituons la pioche en partant de ce pli: ' + this.data.pli);
            while (this.data.pli.length!==1) {
                this.data.pioche.unshift(this.data.pli[0]);
                console.log('pioche augmentée de 1 carte; longueur de la pioche ' + this.data.pioche.length);
                this.data.pli.splice(0,1);
                console.log('pli diminué de 1 carte; longueur du pli ' + this.data.pli.length);
                callback();
            }
            console.log('Mélangeons la pioche! Pioche avant mélange: ' + this.data.pioche);
            shuffle(this.data.pioche);
            console.log('Pioche après mélange: ' + this.data.pioche);
        }
        console.log('carte cliquée: ' + carte);
        //const carteIndex = this.data.pioche.reverse().findIndex(c => c === carte);
        const carteIndex = this.data.pioche.lastIndexOf(carte);
        if (carteIndex === -1) {
            console.warn("la carte cliquée n'est pas reconnue");
            return;
        }
        this.data.pioche.splice(carteIndex, 1);
        this.data.cartesJoueurs[qui].push(carte);
        console.log('joueur ' + qui + ' a pioché la carte index ' + carteIndex);
        // defini le nombre de cartes restant à piocher
        this.data.cartesRestantesAPiocher = this.data.cartesRestantesAPiocher -1;
        console.log('Cartes restantes à piocher: ' + this.data.cartesRestantesAPiocher);

        callback();
    };

    public piocheClick(qui: number, carte: Card, callback: () => void) {
        if (this.data.etat === Etats.JEU) {
            console.log('entré dans piocheClick');
            this.piocheCarte(qui, carte, callback);
        }
        callback();
    }

    public distribue(stepCallback: () => void) {
        if (this.data.etat === Etats.DISTRIBUER) {
            console.log('Etat avant distribution: ' + this.data.etat);
            const nbCartesTotal = this.data.cartes.length;
            console.log('le tas de cartes avant distribution: ' + this.data.cartes + '; de longueur ' + nbCartesTotal);
            const nbCartesParJoueur = 7;
            const dos = (prochain: number) => {
                if (this.data.cartes.length <= nbCartesTotal - nbCartesParJoueur * this.data.joueurs) {
                    console.log('Distribution terminée, passage à la pioche');
                    stepCallback();
                    this.data.etat = Etats.CONSTITUER_PIOCHE;
                    console.log('Etat en fin de distribution: ' + this.data.etat);
                    console.log('Tas de cartes restant en fin de distribution: ' + this.data.cartes + '; de longueur ' + this.data.cartes.length);
                    this.constituerPioche(() => {
                        if (!this) {
                            return;
                        }
                        stepCallback();
                    });
                    return;
                }
                this.data.cartesJoueurs[prochain] = this.data.cartesJoueurs[prochain].concat(this.data.cartes.slice(0, 1)); // distribue à un joueur la carte 0 de la pile
                this.data.cartes = this.data.cartes.slice(1); // la pile de carte a une carte de moins :-) 
                console.log('Distribution en cours, ' + this.data.cartes.length + ' cartes restantes');
                stepCallback();

                setTimeout(() => dos((prochain + 1) % this.data.joueurs), 100);

            };

            dos(this.data.tourDe);
        }
    }

    public constituerPioche(stepCallback2: () => void) {
        if (this.data.etat === Etats.CONSTITUER_PIOCHE){
            console.log('Nous allons commencer, Etat:' + this.data.etat);
            console.log('Pioche avant de commencer: ' + this.data.pioche + ' de longueur ' + this.data.pioche.length);
            let cartesPourPioche = this.data.cartes;
            //console.log('le tas de cartes à mettre dans la pioche: ' + this.data.cartes);
            const cartesPourPiocheFixe = this.data.cartes;
            console.log('le tas de cartes fixe à mettre dans la pioche: ' + cartesPourPiocheFixe);
            // initialise la pioche avec les cartes restantes
            const dos = (i: number) => {
                if (i === cartesPourPiocheFixe.length) {
                    console.log('Plus de cartes à mettre dans la pioche');
                    this.data.etat = Etats.JEU;
                    console.log('la pioche avant début du jeu: '+ this.data.pioche + '; de longueur ' + this.data.pioche.length);
                    // joue la première carte de la pioche
                    this.data.pli.push(this.data.pioche[this.data.pioche.length-1]);
                    console.log('carte jouée pour commencer: '+ this.data.pioche[this.data.pioche.length-1]);
                    this.data.pioche.splice(-1,1);
                    console.log('la pioche avant début du jeu: '+ this.data.pioche + '; de longueur ' + this.data.pioche.length);
                    // initialise la couleur maitre et valeur maitre avec la carte jouée
                    this.data.couleurMaitrePile = this.data.pli[0].substring(0,1);
                    this.data.valeurMaitrePile = this.data.pli[0].substring(1);
                    console.log('la carte maitre est de COULEUR: ' + this.data.couleurMaitrePile + ' ; et de VALEUR: ' + this.data.valeurMaitrePile);
                    stepCallback2();
                    return;
                }
                this.data.pioche = this.data.pioche.concat(cartesPourPiocheFixe[i]);
                console.log('Cartes restantes à mettre dans la pioche ' + cartesPourPioche.length);
                console.log('Nb de cartes mises dans la pioche ' + this.data.pioche.length);
                console.log('la pioche à ce stade: ' + this.data.pioche);
                stepCallback2();
                setTimeout(() => dos(i + 1), 50); // (prochain + 1) % this.data.joueurs)
            }
            dos(0);
        }
    };


    public anonymize(qui: number): IData {
        //let chien = this.data.chien;
        let pli = this.data.pli;
        const cartesJoueurs = this.data.cartesJoueurs.map((cartes, i) => {
            if (i === qui) {
                return cartes;
            } else {
                return cartes.map(() => '--');
            }
        });
        
        //let pliFait = this.data.pileFait;
/*         if (this.data.dernierpli.length === 0) {
            pliFait = pliFait.map(
                (cartes, i) => this.data.preneur !== i || qui !== i ? cartes.map(() => '--') : cartes);
        } else {
            pliFait = pliFait.map(
                cartes => cartes.map(c => this.data.dernierPli.findIndex(pc => pc === c) === -1 ? '--' : c));
        } */
        const cartesCachés = this.data.cartes.map(() => '--');
        return {...this.data, pli, cartes: cartesCachés, cartesJoueurs};
    }

    public jePasse (qui: number, callback: () => void) {
        if (this.data.etat !== Etats.JEU) {
            console.warn('tu ne peux pas passer, jeu pas commencé!');
            return;
        } else if (qui !== this.data.tourDe) {
            console.warn('tu ne peux pas passer, pas ton tour!');
            return;
        }

        if (this.data.tourDe === qui) {
            if (this.data.sensHoraire){
                this.data.tourDe = (this.data.tourDe + 1) % this.data.joueurs;
                this.data.cartesRestantesAPiocher = 1;
                callback();
            } else {
                this.data.tourDe = (this.data.joueurs + this.data.tourDe - 1) % this.data.joueurs;
                this.data.cartesRestantesAPiocher = 1;
                callback();
            }
        }
    }

}

function shuffle(a: Card[]) {
    for (let i = a.length; i; i -= 1) {
        const j = Math.floor(Math.random() * i);
        const x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}



