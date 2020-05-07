import React from 'react';
import uuid from 'uuid';
import websocket from 'websocket';
import {Actions} from '../datastructure/actions';
import {ServerResponse, ServerResponses} from '../datastructure/responses';
import {IData} from '../interfaces/IData';
import {Etats} from '../server/Jeu';
import Chat from './Chat';
import Nom from './Nom';
import Table from './Table';
import {WEB_SERVER} from '../sharedconfig';

const w3cwebsocket: typeof WebSocket = (websocket as any).w3cwebsocket;

interface ITarotState {
    chat_attendant: string;
    client: WebSocket | null;
    guid: string;
    jeu: IData | null;
    joueurs: string[] | null;
    moi: number | null;
    nomJoueur: string;
}

export default class Tarot extends React.Component<{}, ITarotState> {
    public state: ITarotState = {
        chat_attendant: '',
        client: null,
        guid: '',
        jeu: null,
        joueurs: null,
        moi: null,
        nomJoueur: '',
    };

    public componentWillMount() {
        const nomJoueur = localStorage.getItem('nomJoueur');
        if (nomJoueur) {
            this.setState({nomJoueur});
        }
        let guid;
        const guidItem = localStorage.getItem('guid');
        if (guidItem !== null) {
            guid = guidItem;
        } else {
            guid = uuid.v4();
            localStorage.setItem('guid', guid);
        }

        this.setState({guid});
    }

    public componentDidMount() {
        this.connectWebsocket();
    }

    public connectWebsocket() {
        const client = new w3cwebsocket((location.protocol === 'http:' ? 'ws://' : 'wss://') + location.hostname +
            (location.port ? ':' + location.port : '') + WEB_SERVER + '/ws/', 'uno-protocol');

        client.onerror = () => {
            console.error('Connection Error');
            setTimeout(() => this.connectWebsocket(), 60000);
        };

        client.onopen = () => {
            console.debug('WebSocket Client Connected');
            if (client.readyState === client.OPEN) {
                client.send(JSON.stringify(Actions.makeRejoindre(this.state.guid)));
                this.setState({client});
            }
        };

        client.onclose = () => {
            console.debug('uno-protocol Client Closed');
            setTimeout(() => this.connectWebsocket(), 6000);
        };

        client.onmessage = e => {
            if (typeof e.data === 'string') {
                const m: ServerResponse = JSON.parse(e.data);
                console.debug(m);
                switch (m.type) {
                    case ServerResponses.JEU:
                        this.setState({jeu: m.jeu});
                        break;
                    case ServerResponses.JOUEUR_JOINT: {
                        const moi = m.guids.findIndex(guid => guid === this.state.guid);
                        if (moi === -1) {
                            this.setState({joueurs: null, moi: null, chat_attendant: ''});
                        } else {
                            this.setState({joueurs: m.joueurs, moi, chat_attendant: m.chat_attendant});
                        }
                        break;
                    }
                    case ServerResponses.REJOINDU: {
                        this.setState({moi: m.moi});
                        break;
                    }
                }
            }
        };
    }

    public componentWillUpdate(nextProps: {}, nextState: ITarotState) {
        if (this.state.jeu === null) {
            if (nextState.jeu != null) {
                notifyUser('Le jeu a commencé!', 'ding');
            } else if (this.state.chat_attendant !== nextState.chat_attendant) {
                notifyUser('Nouveau chat!', 'blop');
            }
        } else {
            if (nextState.jeu != null) {
                const moi = this.state.moi;
                if (moi !== null && cestAmoi(nextState.jeu, moi) && !cestAmoi(this.state.jeu, moi)) {
                    notifyUser('C’est à toi!', 'ding');
                } else if (this.state.jeu.chat !== nextState.jeu.chat) {
                    notifyUser('Nouveau chat!', 'blop');
                }
            }
        }

        function cestAmoi(jeu: IData, moi: number) {
            return (jeu.etat === Etats.JEU && jeu.tourDe === moi) ||
                (jeu.etat === Etats.COUPER && jeu.coupDe === moi)
        }
    }

    public render() {
        const {client} = this.state;
        if (client == null || client.readyState !== client.OPEN) {
            return <span>Waiting for server...</span>;
        }
        if (this.state.jeu == null || this.state.moi === null) {
            if (this.state.joueurs == null) {
                return <form onSubmit={e => {
                    e.preventDefault();
                    client.send(JSON.stringify(Actions.makeJoindre(this.state.guid, this.state.nomJoueur)));
                }}>
                    <input type="text" value={this.state.nomJoueur} placeholder="Nom" onChange={e => {
                        this.setState({nomJoueur: e.target.value});
                        localStorage.setItem('nomJoueur', e.target.value);
                    }}/>
                    <input type="submit" value="Joindre"/>
                </form>;
            } else {
                return <div>
                    {this.state.joueurs.length} joueurs: <Nom nom={this.state.joueurs}/><br/>
                    {this.state.joueurs.length >=2 ? 
                    <input type="button" value="Commencer le jeu"
                    onClick={() => client.send(JSON.stringify(Actions.makeStart()))}/>: ''}
                    <input type="button" value="Quitter"
                           onClick={() => client.send(JSON.stringify(Actions.makeQuitter()))}/>
                    <Chat chat={this.state.chat_attendant}
                          onSubmit={message => client.send(JSON.stringify(Actions.makeSendMessage(message)))}/>
                </div>;
            }
        }

        return <div>
            <Table jeu={this.state.jeu}
                   moi={this.state.moi}
                   onPlayCard={card => client.send(JSON.stringify(Actions.makeCarteClick(card)))}
                   onCouper={nombre => client.send(JSON.stringify(Actions.makeCoupe(nombre)))}
                   onPioche={card => client.send(JSON.stringify(Actions.makePiocheClick(card)))}
                   onPasse={passe => client.send(JSON.stringify(Actions.makePasse()))}
                   onChoixCouleur={couleurClick => client.send(JSON.stringify(Actions.makeChoixCouleur(couleurClick)))}
                   //onUno={sayUno => client.send(JSON.stringify(Actions.makeSayUno()))}
            />
            {this.state.jeu.etat === Etats.FINI ? <input type="button" value="Prochain jeu"
                                                         onClick={() => client.send(
                                                             JSON.stringify(Actions.makeProchainJeu()))}/> : ''}
            <Chat chat={this.state.jeu.chat}
                  onSubmit={message => client.send(JSON.stringify(Actions.makeSendMessage(message)))}/>
            <input type="button" value="Fermer le jeu"
                   onClick={() => client.send(JSON.stringify(Actions.makeQuitterJeu()))}/>
        </div>;
    }
}

function notifyUser(text: string, sound: string) {
    if (pageActive) {
        return;
    }
    const audio = new Audio(WEB_SERVER + '/static/' + sound + '.ogg');
    audio.play()
        .catch(() => {
            const fallbackAudio = new Audio(WEB_SERVER + '/static/' + sound + '.mp3');
            fallbackAudio.play();
        });
}


let pageActive = true;
window.addEventListener('focus', () => pageActive = true);
window.addEventListener('blur', () => pageActive = false);
