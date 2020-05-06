import React from 'react';
import {Card} from '../enums/Card';
import {IData} from '../interfaces/IData';
import {Etats} from '../server/Jeu';
import CardStack from './CardStack';
import Pioche from './Pioche';
import Nom from './Nom';

export interface ITableProps {
    jeu: IData;
    moi: number;
    onCouper: (count: number) => void;
    onPlayCard: (card: Card) => void;
    onPioche: (card: Card) => void;
    onPasse: (passe: Boolean) => void;
    onChoixCouleur: (couleurClick: string) => void;
    //onUno: (sayUno: Boolean) => void;
}

export default class Table extends React.Component<ITableProps> {
    public state = {
        couperA: 0,
    };

    public render() {
        const jeu = this.props.jeu;
        const cartes = jeu.cartesJoueurs.map((cartesJoueur, i) => {
            if (i === this.props.moi) {
                return <span key={i} />;
            } else if (jeu.cartesJoueurs[i].length > 0) {
                return <div key={i} className="stackinline">
                    Joueur <Nom nom={jeu.nomJoueurs[i]} />:{' '}
                    <CardStack className="smallstack" cartes={cartesJoueur} />
                </div>;
            } else {
                return <br/>
            }
        });

/*         const plisFait = jeu.pliFait.map((pli, i) => {
            if (pli.length > 0) {
                return <div key={i} className="stackinline">
                    Plis joueur <Nom nom={jeu.nomJoueurs[i]}/>:{' '}
                    <CardStack className="smallstack" cartes={pli}/>
                </div>;
            } else {
                return <div key={i}/>;
            }
        }); */

        let couleurAJouer;
        switch (jeu.couleurMaitrePile) {
            case 'B':{
                couleurAJouer='Bleu'; break;
            };
            case 'R':{
                couleurAJouer='Rouge'; break;
            }
            case 'J':{
                couleurAJouer='Jaune'; break;
            }
            case 'V':{
                couleurAJouer='Vert'; break;
            }
            case 'M':{
                couleurAJouer='Ce que tu veux'; break;
            }
        }
        
        let status;
        if (jeu.etat === Etats.JEU) {
            if (jeu.tourDe === this.props.moi && jeu.valeurMaitrePile ==='p2' && jeu.cartesRestantesAPiocher===2) {
                status = <span>La couleur à jouer est <b>{couleurAJouer}</b>. <br/> <b>Pioche 2 cartes!</b> </span>;
            } else if (jeu.tourDe === this.props.moi && jeu.valeurMaitrePile==='p4' && jeu.cartesRestantesAPiocher===4) {
                status = <span>La couleur à jouer est <b>{couleurAJouer}</b>. <br/> <b>Pioche 4 cartes!</b> </span>;
            } else if (jeu.tourDe === this.props.moi) {
                status = <span>La couleur à jouer est <b>{couleurAJouer}</b>. <br/> <b>Choisi une de tes cartes!</b> </span>;
            } else {
                status = <span>C’est le tour de joueur <Nom nom={jeu.nomJoueurs[jeu.tourDe]}/>. </span>;
            }
        } else if (jeu.etat === Etats.COUPER) {
            if (jeu.coupDe === this.props.moi) {
                status = <b>Choisi le nombre de carte que tu veux couper!</b>;
            } else if (jeu.coupDe !== null) {
                status = <span>C’est à <Nom nom={jeu.nomJoueurs[jeu.coupDe]}/> de couper. </span>;
            }
        } else if (jeu.etat === Etats.CHOIX_COULEUR && jeu.tourDe === this.props.moi) {
            let rouge = 'Rouge';
            let jaune = 'Jaune';
            let vert = 'Vert';
            let bleu = 'Bleu';
            status = <div> <b>Choisis la couleur à jouer...</b>
            <br/>
            <input type="button" value="Rouge" onClick={() => this.props.onChoixCouleur(rouge.substring(0,1))}/>
            <input type="button" value="Jaune" onClick={() => this.props.onChoixCouleur(jaune.substring(0,1))}/>
            <input type="button" value="Vert" onClick={() => this.props.onChoixCouleur(vert.substring(0,1))}/>
            <input type="button" value="Bleu" onClick={() => this.props.onChoixCouleur(bleu.substring(0,1))}/>
        </div>
        }
                
        
        let indicateurSens;
        if (jeu.etat === Etats.JEU && jeu.tourDe !== null) {
            let r = 60;
            let sizeIndicateur = 200;
            let xcenter = sizeIndicateur / 2;
            let ycenter = sizeIndicateur / 2;
            const NomJoueurDisplay = jeu.nomJoueurs.map(nomJoueur => {
                let index = jeu.nomJoueurs.indexOf(nomJoueur);
                const x = xcenter + Math.round(Math.cos((2 * Math.PI / jeu.joueurs) * index) * r);
                const y = ycenter - Math.round(Math.sin((2 * Math.PI / jeu.joueurs) * index) * r);
                console.log('x = ' + x + '; y = ' + y);
                return <div className="positionNomJoueurs"
                    style={{ left: x + 'px', top: y + 'px' }}> <Nom nom={nomJoueur} /> </div>
            });

            if (jeu.sensHoraire === true) {
                indicateurSens = <div className="container">
                    <img className="sensCercle" src="/tarot/img/sensCercleAntiBigBorder.png" style={{ width: sizeIndicateur + 'px', height: sizeIndicateur + 'px' }} />
                    {NomJoueurDisplay}
                </div>
            }

            if (jeu.sensHoraire === false) {
                indicateurSens = <div className="container">
                    <img className="sensCercle" src="/tarot/img/sensCercleBigBorder.png" style={{ width: sizeIndicateur + 'px', height: sizeIndicateur + 'px' }} />
                    {NomJoueurDisplay}
                </div>
            }
        }

        let resultat;
        if (jeu.resultat !== null && jeu.joueurGagnant!==null){
            resultat = <div>
                <Nom nom={jeu.nomJoueurs[jeu.joueurGagnant]}/> (Joueur {jeu.joueurGagnant}) a gagné et a marqué {jeu.resultat} points.
            </div>
        }

        let mesCartes;
        if (jeu.cartesJoueurs[this.props.moi].length>0){
            mesCartes = <div>
            Mes cartes:
            <CardStack className="stack" cartes={jeu.cartesJoueurs[this.props.moi]}
                       onClick={card => this.props.onPlayCard(card)}/>
        </div>
        } else {
            mesCartes = <br/>;
        }


        /* function defineCouleurMaitrePile (couleur:String) {
            console.log('fonction defineCouleurMaitrePile appelée!')
            jeu.couleurMaitrePile = couleur;
            console.log('la couleur maitre est maintenant: ' + jeu.couleurMaitrePile);
        } */

        return <div>
            <div>Tu es le joueur <Nom nom={jeu.nomJoueurs[this.props.moi]}/>
            <br/>
            {status}
            <br/>
            </div>
            {indicateurSens}
            {(jeu.coupDe === this.props.moi && jeu.etat === Etats.COUPER) ?
                <form onSubmit={e => {
                    e.preventDefault();
                    this.props.onCouper(this.state.couperA);
                }}>
                    <input type="text" value={this.state.couperA} onChange={e => this.setState(
                        {couperA: Math.min(jeu.cartes.length, Math.max(0, Number(e.target.value)))})}/>
                    <input type="submit" value="Couper"/>
                </form>
                : ''}
            <div>
                <div>Le jeu:</div>
                <CardStack className="pile" cartes={[jeu.pli[jeu.pli.length-1]]} onClick={card => this.props.onPlayCard(card)}/>
                <input type="button" className="buttonUno" value="UNO!" onClick={() => sayUno()}/>
            </div>
            <br/>
            <div>
                La pioche:
                <Pioche className="pioche" cartes={jeu.pioche} //[jeu.pioche[jeu.pioche.length-1]] pour une seule carte
                            onClick={card => this.props.onPioche(card)}/>
            </div>
            <br/>
            {jeu.tourDe === this.props.moi && jeu.etat === Etats.JEU && 
            ((jeu.cartesRestantesAPiocher === 0 && 
                (jeu.valeurMaitrePile ==='p2' || jeu.valeurMaitrePile ==='p4')) 
            || 
            ((jeu.cartesRestantesAPiocher ===0)&& 
                (jeu.valeurMaitrePile !=='p2' && jeu.valeurMaitrePile !=='p4')))?
            (<div>
            <input type="button" value="Je passe mon tour" onClick={() => this.props.onPasse(true)}/>
            </div>) : ''}
            <br/>
            {/* <div>
                Mes cartes:
                <CardStack className="stack" cartes={jeu.cartesJoueurs[this.props.moi]}
                           onClick={card => this.props.onPlayCard(card)}/>
            </div> */}
            {mesCartes}
            {cartes}
            <br/>
            {jeu.resultat !== null && jeu.joueurGagnant!==null ? resultat : ''}
        </div>;
    }
}

function sayUno (){
    //this.props.sayUno(,)
    const audio = new Audio('/tarot/static/siren.ogg');
    audio.play()
        .catch(() => {
            const fallbackAudio = new Audio('/tarot/static/siren.mp3');
            fallbackAudio.play();
        });
}

