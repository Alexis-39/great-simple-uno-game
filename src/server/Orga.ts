import { readFile, writeFile } from 'fs';
import { connection as WebsocketConnection } from 'websocket';
import { Action, Actions } from '../datastructure/actions';
import { ServerResponses } from '../datastructure/responses';
import { IData } from '../interfaces/IData';
import Jeu, { Etats } from './Jeu';

interface ISavedGame {
    jeux: Array<{ jeuData: IData, guids: string[] }>;
    known_guids: { [guid: string]: { jeuId: number, joueur: number } };
    joueur_attendant: Array<{ guid: string, nomJoueur: string }>;
    chat_attendant: string;
}

interface IJoueur {
    guid: string;
    connection?: WebsocketConnection;
    nomJoueur: string;
    startCallback?: () => void | null;
}

const jeux: Jeu[] = [];

let knownGuids: { [guid: string]: { jeu: Jeu, joueur: number } } = {};

let joueurAttendant: IJoueur[] = [];
let chatAttendant = '';

export function save(file: string, callback: () => void) {
    const savedKnownGuids: ISavedGame['known_guids'] = {};
    for (const guid in knownGuids) {
        if (knownGuids.hasOwnProperty(guid)) {
            savedKnownGuids[guid] = {
                jeuId: jeux.findIndex(j => j === knownGuids[guid].jeu),
                joueur: knownGuids[guid].joueur,
            };
        }
    }
    const data: ISavedGame = {
        chat_attendant: chatAttendant,
        jeux: jeux.map(jeu => ({ jeuData: jeu.data, guids: jeu.guids })),
        joueur_attendant: joueurAttendant.map(j => ({ ...j, startCallback: null, connection: null })),
        known_guids: savedKnownGuids,
    };
    writeFile(file, JSON.stringify(data), err => {
        if (err) {
            throw err;
        }
        if (callback) {
            callback();
        }
    });
}

export function open(file: string, callback?: () => void) {
    readFile(file, (err, content) => {
        if (!err) {
            const data: ISavedGame = JSON.parse(content.toString());
            data.jeux.forEach(({ jeuData, guids }) => jeux.push(new Jeu(jeuData, guids)));
            const loadedKnownGuids: typeof knownGuids = {};
            for (const guid in data.known_guids) {
                if (data.known_guids.hasOwnProperty(guid)) {
                    loadedKnownGuids[guid] = {
                        jeu: jeux[data.known_guids[guid].jeuId],
                        joueur: data.known_guids[guid].joueur,
                    };
                }
            }
            knownGuids = loadedKnownGuids;
            joueurAttendant = data.joueur_attendant;
            chatAttendant = data.chat_attendant;
        }
        if (callback) {
            callback();
        }
    });
}

export function createActionHandler(connection: WebsocketConnection) {
    let jeu: Jeu | null = null;
    let guid: string | null = null;
    let moi: number | null = null;
    return (m: Action) => {
        if (jeu && jeu.invalid) {
            jeu = null;
            moi = null;
        }
        console.log(m.type);
        switch (m.type) {
            case Actions.JOINDRE: {
                if (joueurAttendant.length >= 10) {
                    console.warn('too many players - You can play Uno with maximum 10 players');
                    // TODO error
                    return;
                }

                const nomJoueur = m.nomJoueur.substring(0, 50).replace(/,/g, ' ');
                if (joueurAttendant.findIndex(j => j.nomJoueur === nomJoueur) !== -1) {
                    console.warn('player name already exists');
                    // TODO error
                    return;
                }
                const newGuid = m.guid;
                joueurAttendant.push({
                    connection,
                    guid: newGuid,
                    nomJoueur,
                    startCallback: () => {
                        jeu = knownGuids[newGuid].jeu;
                        moi = joueurAttendant.findIndex(j => j.guid === newGuid);
                    },
                });
                guid = newGuid;
                joueurAttendant.forEach(({ connection: joueurConnection }) => sendJoueurs(joueurConnection));
                break;
            }
            case Actions.REJOINDRE: {
                const index = joueurAttendant.findIndex(j => j.guid === m.guid);
                if (index !== -1) {
                    const newGuid = m.guid;
                    joueurAttendant[index].connection = connection;
                    joueurAttendant[index].startCallback = () => {
                        jeu = knownGuids[newGuid].jeu;
                        moi = joueurAttendant.findIndex(j => j.guid === newGuid);
                    };
                    guid = newGuid;
                    sendJoueurs(connection);
                } else if (m.guid in knownGuids) {
                    guid = m.guid;
                    moi = knownGuids[guid].joueur;
                    jeu = knownGuids[guid].jeu;
                    jeu.connections[moi] = connection;
                    connection.sendUTF(JSON.stringify(ServerResponses.makeRejoindu(moi)));
                    sendToAll(jeu);
                } else {
                    // TODO error
                    return;
                }
                break;
            }
            case Actions.QUITTER: {
                const index = joueurAttendant.findIndex(j => j.guid === guid);
                if (index === -1) {
                    return;
                }
                joueurAttendant.splice(index, 1);
                joueurAttendant.forEach(({ connection: joueurConnection }) => sendJoueurs(joueurConnection));
                sendJoueurs(connection);
                break;
            }
            case Actions.START:
                if (joueurAttendant.length < 2) {
                    console.warn('not enough player');
                    // TODO error
                    return;
                }
                const newJeu = Jeu.creeNouveauJeu(getNomJoueurs());
                jeux.push(newJeu);
                joueurAttendant.forEach(({ guid: joueurGuid, connection: joueurConnection }, i) => {
                    knownGuids[joueurGuid] = { jeu: newJeu, joueur: i };
                    if (joueurConnection != null) {
                        newJeu.connections[i] = joueurConnection;
                    }
                    newJeu.guids.push(joueurGuid);
                });
                joueurAttendant.forEach(({ startCallback }, i) => {
                    if (startCallback != null) {
                        startCallback();
                    }
                });
                joueurAttendant = [];
                newJeu.data.chat = chatAttendant;
                chatAttendant = '';
                sendToAll(newJeu);
                jeu = newJeu;
                console.warn('Action commencer jeu success');
                break;

            case Actions.COUPE:
                if (!jeu) {
                    console.warn('Action non permis, jeu pas commencé');
                    return;
                }
                jeu.coupe(m.nombre);
                sendToAll(jeu);
                jeu.distribue(() => {
                    if (!jeu) {
                        return;
                    }
                    sendToAll(jeu);
                });

                jeu.constituerPioche(() => {
                    if (!jeu) {
                        return;
                    }
                    sendToAll(jeu);
                });
                break;

            case Actions.CARTE_CLICK:
                if (!jeu || moi === null) {
                    console.warn('Action non permis, jeu pas commencé');
                    return;
                }
                jeu.carteClick(moi, m.carte, () => {
                    if (!jeu) {
                        return;
                    }
                    sendToAll(jeu);
                });
                break;

            case Actions.PIOCHE_CLICK:
                if (!jeu || moi === null) {
                    console.warn('Action non permise, jeu pas commencé');
                    return;
                }
                jeu.piocheClick(moi, m.carte, () => {
                    if (!jeu) {
                        return;
                    }
                    //console.log('Pioche cliquée')
                    sendToAll(jeu);
                });
                break;

            case Actions.PASSE:
                if (!jeu || moi === null) {
                    console.warn("Tu ne peux pas passer, ce n'est pas ton tour ou il n'a a pas de jeu");
                    return;
                }
                jeu.jePasse(moi, () => {
                    if (!jeu) {
                        return;
                    }
                    console.log('Je passe')
                    sendToAll(jeu);
                });
                break;

            /* case Actions.SAY_UNO:
                if (jeu && moi !== null) {   
                    jeu.sayUno(moi, () => {
                        if (!jeu) {
                            return;
                        }
                        console.log('Je dis Uno!')
                        sendToAll(jeu);
                    });
                };
                break; */

            case Actions.CHOIX_COULEUR:
                if (!jeu) {
                    return
                };
                if (jeu.data.etat !== Etats.CHOIX_COULEUR) {
                    return
                };
                if (jeu.data.etat === Etats.CHOIX_COULEUR && jeu.data.tourDe === moi) {
                    jeu.choixCouleur(m.couleurClick, () => {
                        if (!jeu) {
                            return;
                        }
                        sendToAll(jeu);
                    });
                }
                break;
                
            case Actions.QUITTER_JEU:
                if (jeu) {
                    jeu.guids.forEach(joueurGuid => {
                        delete knownGuids[joueurGuid];
                    });
                    jeu.connections.forEach(jeuConnection => {
                        jeuConnection.sendUTF(JSON.stringify(ServerResponses.makeJeu(null)));
                        sendJoueurs(jeuConnection);
                    });
                    jeux.splice(jeux.findIndex(j => j === jeu), 1);
                    jeu.invalid = true;
                }
                break;
            case Actions.PROCHAIN_JEU:
                if (jeu) {
                    jeu.prochainJeu();
                    sendToAll(jeu);
                }
                break;
            case Actions.SEND_MESSAGE:
                if (jeu !== null && moi !== null) {
                    jeu.data.chat = getChatMessage(jeu.data.nomJoueurs[moi], m.message) + jeu.data.chat;
                    sendToAll(jeu);
                } else if (guid) {
                    const joueur = joueurAttendant.find(j => j.guid === guid);
                    if (!joueur) {
                        return;
                    }
                    chatAttendant = getChatMessage(joueur.nomJoueur, m.message) + chatAttendant;
                    joueurAttendant.forEach(({ connection: joueurConnection }) => sendJoueurs(joueurConnection));
                }
                break;
        }
    };

    function getChatMessage(name: string, message: string) {
        return new Date().toTimeString().substring(0, 8) + ' ' + name + ': ' +
            message.substring(0, 100).replace(/\n/g, ' ') + '\n';
    }

    function getNomJoueurs() {
        return joueurAttendant.map(j => j.nomJoueur);
    }

    function sendJoueurs(con?: WebsocketConnection) {
        if (!con) {
            return;
        }
        con.sendUTF(JSON.stringify(
            ServerResponses.makeJoueurJoint(getNomJoueurs(), joueurAttendant.map(j => j.guid), chatAttendant)));
    }
}

export function sendToAll(jeu: Jeu) {
    jeu.connections.forEach((connection, moi) => {
        const data = { ...jeu.anonymize(moi), moi };
        connection.sendUTF(JSON.stringify(ServerResponses.makeJeu(data)));
    });
}
