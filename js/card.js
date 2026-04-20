let tenScore = 5;
var CardSuit;
(function (CardSuit) {
    CardSuit["Spades"] = "\u2660";
    CardSuit["Diamonds"] = "\u2666";
    CardSuit["Clubs"] = "\u2663";
    CardSuit["Hearts"] = "\u2665";
})(CardSuit || (CardSuit = {}));
const cardSuitToNumber = {};
cardSuitToNumber[CardSuit.Spades] = 1;
cardSuitToNumber[CardSuit.Diamonds] = 2;
cardSuitToNumber[CardSuit.Clubs] = 3;
cardSuitToNumber[CardSuit.Hearts] = 4;
var CardRank;
(function (CardRank) {
    CardRank["Ace"] = "A";
    CardRank["Two"] = "2";
    CardRank["Three"] = "3";
    CardRank["Four"] = "4";
    CardRank["Five"] = "5";
    CardRank["Six"] = "6";
    CardRank["Seven"] = "7";
    CardRank["Eight"] = "8";
    CardRank["Nine"] = "9";
    CardRank["Ten"] = "10";
    CardRank["Jack"] = "J";
    CardRank["Queen"] = "Q";
    CardRank["King"] = "K";
})(CardRank || (CardRank = {}));
const cardRankToNumber = {};
cardRankToNumber[CardRank.Ace] = 1;
cardRankToNumber[CardRank.Two] = 2;
cardRankToNumber[CardRank.Three] = 3;
cardRankToNumber[CardRank.Four] = 4;
cardRankToNumber[CardRank.Five] = 5;
cardRankToNumber[CardRank.Six] = 6;
cardRankToNumber[CardRank.Seven] = 7;
cardRankToNumber[CardRank.Eight] = 8;
cardRankToNumber[CardRank.Nine] = 9;
cardRankToNumber[CardRank.Ten] = 10;
cardRankToNumber[CardRank.Jack] = 11;
cardRankToNumber[CardRank.Queen] = 12;
cardRankToNumber[CardRank.King] = 13;
const numberToCardRank = {};
numberToCardRank[1] = CardRank.Ace;
numberToCardRank[2] = CardRank.Two;
numberToCardRank[3] = CardRank.Three;
numberToCardRank[4] = CardRank.Four;
numberToCardRank[5] = CardRank.Five;
numberToCardRank[6] = CardRank.Six;
numberToCardRank[7] = CardRank.Seven;
numberToCardRank[8] = CardRank.Eight;
numberToCardRank[9] = CardRank.Nine;
numberToCardRank[10] = CardRank.Ten;
numberToCardRank[11] = CardRank.Jack;
numberToCardRank[12] = CardRank.Queen;
numberToCardRank[13] = CardRank.King;
function previousCardRank(currentRank) {
    const rankNumber = cardRankToNumber[currentRank];
    return rankNumber <= 0 ? null : numberToCardRank[rankNumber - 1];
}
function nextCardRank(currentRank) {
    const rankNumber = cardRankToNumber[currentRank];
    return rankNumber >= Object.keys(cardRankToNumber).length - 1 ? null : numberToCardRank[rankNumber + 1];
}
class Card {
    suit;
    rank;
    get score() {
        switch (this.rank) {
            case CardRank.Ace:
                return 20;
            case CardRank.Jack:
            case CardRank.Queen:
            case CardRank.King:
                return 10;
            case CardRank.Ten:
                return tenScore;
            default:
                return 5;
        }
    }
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
    }
    equals(other) {
        return this.suit === other.suit && this.rank === other.rank;
    }
    static getDeck() {
        const cards = [];
        for (const suit of Object.keys(CardSuit)) {
            for (const rank of Object.keys(CardRank)) {
                cards.push(new Card(CardSuit[suit], CardRank[rank]));
            }
        }
        return cards;
    }
}
