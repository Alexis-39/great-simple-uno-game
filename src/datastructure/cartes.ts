import {Card} from '../enums/Card';

const cartes: Card[] = [];

['R', 'B', 'V', 'J'].forEach(color => {
    createCards0to9(color);
    duplicateCards1to9(color);
    // create plusDeux cards (2 for each color). 
    // format is 'Rp2' for a red plusDeux
    cartes.push(color + 'p2');
    cartes.push(color + 'p2');
    // create passeTonTour cards (2 for each color). 
    // format is 'Rt' for a red passeTonTour
    cartes.push(color + 't');
    cartes.push(color + 't');
    // create chgmtSens cards (2 for each color). 
    // format is 'Rc' for a red chgmtSens
    cartes.push(color + 'c');
    cartes.push(color + 'c');
});

// create 4x multicolor plusQuatre with format 'Mp4'
cartes.push('Mp4');
cartes.push('Mp4');
cartes.push('Mp4');
cartes.push('Mp4');

// create 4x multicolor joker with format 'Mj'
cartes.push('Mj');
cartes.push('Mj');
cartes.push('Mj');
cartes.push('Mj');

function duplicateCards1to9(color: string) {
    for (let j = 1; j <= 9; j++) {
        // duplicate cards 1 to 9 for each color
        cartes.push(color + j);
    }
}

function createCards0to9(color: string) {
    for (let i = 0; i <= 9; i++) {
        // create card 0 to 9 for each color, one time
        // Those cards are in the format 'R7' for a red 7 for example
        cartes.push(color + i);
    }
}

export const TarotCartes = cartes;

