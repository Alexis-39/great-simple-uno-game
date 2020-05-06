import React from 'react';
import {Card as CardEnum} from '../enums/Card';
import Card from './Card';


export interface ICardStackProps {
    cartes: CardEnum[];
    onClick?: (card: CardEnum) => void;
    className?: string;
}

export default class Pioche extends React.Component<ICardStackProps> {
    public static defaultProps: ICardStackProps = {
        cartes: [],
    };

    public render() {
        const {cartes, onClick, ...forwardProps} = this.props;
        const pioche = cartes.map(carte => <Card showBack={true} card={carte}
                                                        onClick={onClick}/>);

        return <div {...forwardProps}>
            {pioche}
        </div>;
        // '--' shows the back of the card
    }
}