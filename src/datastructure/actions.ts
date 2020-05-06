import {Card} from '../enums/Card';

export type Action =
    { type: typeof Actions.CARTE_CLICK, carte: Card } |
    { type: typeof Actions.PIOCHE_CLICK, carte: Card } |
    { type: typeof Actions.START } |
    { type: typeof Actions.REJOINDRE, guid: string } |
    { type: typeof Actions.QUITTER } |
    { type: typeof Actions.COUPE, nombre: number } |
    { type: typeof Actions.JOINDRE, guid: string, nomJoueur: string } |
    { type: typeof Actions.PASSE, passe: boolean } |
    { type: typeof Actions.SAY_UNO, sayUno: boolean } |
    { type: typeof Actions.CHOIX_COULEUR, couleurClick: string } |
    //{ type: typeof Actions.FAIRE_JEU, carte: Card } |
    //{ type: typeof Actions.FINI_FAIRE_JEU } |
    { type: typeof Actions.QUITTER_JEU } |
    { type: typeof Actions.PROCHAIN_JEU } |
    { type: typeof Actions.SEND_MESSAGE, message: string };

export class Actions {
    public static readonly CARTE_CLICK = 'carteClick';
    public static readonly PIOCHE_CLICK = 'piocheClick';
    public static readonly START = 'start';
    public static readonly REJOINDRE = 'rejoindre';
    public static readonly QUITTER = 'quitter';
    public static readonly COUPE = 'coupe';
    public static readonly JOINDRE = 'joindre';
    public static readonly PASSE = 'passe';
    public static readonly SAY_UNO = 'say uno';
    public static readonly CHOIX_COULEUR = 'choisirCouleur';
    //public static readonly FAIRE_JEU = 'faireJeu';
    public static readonly FINI_FAIRE_JEU = 'finiFaireJeu';
    public static readonly QUITTER_JEU = 'quitterJeu';
    public static readonly PROCHAIN_JEU = 'prochainJeu';
    public static readonly SEND_MESSAGE = 'sendMessage';

    public static readonly makeCarteClick = (carte: Card) => ({type: Actions.CARTE_CLICK, carte});

    public static readonly makePiocheClick = (carte: Card) => ({type: Actions.PIOCHE_CLICK, carte});

    public static readonly makeStart = () => ({type: Actions.START});

    public static readonly makeRejoindre = (guid: string) => ({type: Actions.REJOINDRE, guid});

    public static readonly makeQuitter = () => ({type: Actions.QUITTER});

    public static readonly makeCoupe = (nombre: number) => ({type: Actions.COUPE, nombre});

    public static readonly makeJoindre = (guid: string, nomJoueur: string) => ({
        guid,
        nomJoueur,
        type: Actions.JOINDRE,
    });

    public static readonly makeChoixCouleur = (couleurClick: string) => ({type: Actions.CHOIX_COULEUR, couleurClick});

    public static readonly makePasse = () => ({type: Actions.PASSE});

    public static readonly makeSayUno = () => ({type: Actions.SAY_UNO});

    //public static readonly makeFaireJeu = (carte: Card) => ({type: Actions.FAIRE_JEU, carte});

    public static readonly makeFiniFaireJeu = () => ({type: Actions.FINI_FAIRE_JEU});

    public static readonly makeQuitterJeu = () => ({type: Actions.QUITTER_JEU});

    public static readonly makeProchainJeu = () => ({type: Actions.PROCHAIN_JEU});

    public static readonly makeSendMessage = (message: string) => ({type: Actions.SEND_MESSAGE, message});
}
