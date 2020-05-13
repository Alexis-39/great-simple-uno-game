import React from 'react';
import {Card as CardEnum} from '../enums/Card';
import Jeu from '../server/Jeu';
import {WEB_SERVER} from '../sharedconfig';

export interface ICardProps {
    card: CardEnum;
    onClick?: (card: CardEnum) => void;
    showBack?: Boolean;
}

export default class Card extends React.Component<ICardProps> {
    public static defaultProps: ICardProps = {
        card: '--',
        showBack: false,
    };

    private static findRowColumn(card: CardEnum): { row: number, column: number } {
        switch (card.substring(0, 2)) {
            case 'Mp':
                return {
                    // assign plusQuatre image
                    column: 13,
                    row: 4,
                };
            case 'Mj':
                return {
                    // assign joker image
                    column: 13,
                    row: 0,
                };
            default:
                let row: number | undefined;
                switch (card.substring(0, 1)) {
                    case 'R':
                        row = 0;
                        break;
                    case 'J':
                        row = 1;
                        break;
                    case 'V':
                        row = 2;
                        break;
                    case 'B':
                        row = 3;
                        break;
                    default:
                        throw new Error('Invalid card: ' + card);
                }
                return {
                    column: Jeu.cartesType[card.substring(1)],
                    row,
                };
        }
    }

    public render() {
        const card = this.props.card;
        const showBack = this.props.showBack;
        if (card === '--') {
            return <img className="card" src={WEB_SERVER + '/img/unoback3.png'} style={{width: '57.12px', height: '85.8px'}}
                onClick={()=> {
                    if (this.props.onClick) {
                        this.props.onClick(this.props.card);
                    }
            }}/>;
        }
        if (showBack){
            return <img className="card" src={WEB_SERVER + '/img/unoback3.png'} style={{width: '57.12px', height: '85.8px'}}
                onClick={()=> {
                    if (this.props.onClick) {
                        this.props.onClick(this.props.card);
                    }
            }}/>; 
        }
        
        const {row, column} = Card.findRowColumn(card);
        const style = {
            background: 'url(' + WEB_SERVER + '/img/unocardsS.png)',
            backgroundPosition: (-57.12 * column) + 'px ' + (-85.8 * row) + 'px', //142.8 ; 214.5
            height: '85.8px', //'214.5px'
            width: '57.12px', //'142.8px'
        };
        return <div className="card" style={style} onClick={() => {
            if (this.props.onClick) {
                this.props.onClick(this.props.card);
            }
        }}/>;
    }
}
