import {IData} from '../interfaces/IData';

export type ServerResponse =
    { type: typeof ServerResponses.JEU; jeu: IData | null } |
    { type: typeof ServerResponses.JOUEUR_JOINT; joueurs: string[]; guids: string[]; chat_attendant: string } |
    { type: typeof ServerResponses.REJOINDU; moi: number };

export class ServerResponses {
    public static readonly JEU = 'jeu' as 'jeu';
    public static readonly JOUEUR_JOINT = 'joueurJoint' as 'joueurJoint';
    public static readonly REJOINDU = 'rejoindu';

    public static readonly makeJeu = (jeu: IData | null) => ({type: ServerResponses.JEU, jeu});

    public static readonly makeJoueurJoint = (joueurs: string[], guids: string[], chatAttendant: string) => ({
        chat_attendant: chatAttendant,
        guids,
        joueurs,
        type: ServerResponses.JOUEUR_JOINT,
    })

    public static readonly makeRejoindu = (moi: number) => ({type: ServerResponses.REJOINDU, moi});
}
