let tenScore: number = 5

enum CardSuit {
  Spades = '♠', Diamonds = '♦',
  Clubs = '♣', Hearts = '♥',
}
const cardSuitToNumber: { [key: string]: number } = {}
cardSuitToNumber[CardSuit.Spades  ] = 1
cardSuitToNumber[CardSuit.Diamonds] = 2
cardSuitToNumber[CardSuit.Clubs   ] = 3
cardSuitToNumber[CardSuit.Hearts  ] = 4

enum CardRank {
  Ace = 'A',
  Two = '2', Three = '3', Four = '4', Five = '5',
  Six = '6', Seven = '7', Eight = '8', Nine = '9',
  Ten = '10',
  Jack = 'J', Queen = 'Q', King = 'K',
}
const cardRankToNumber: { [key: string]: number } = {}
cardRankToNumber[CardRank.Ace  ] =  1
cardRankToNumber[CardRank.Two  ] =  2
cardRankToNumber[CardRank.Three] =  3
cardRankToNumber[CardRank.Four ] =  4
cardRankToNumber[CardRank.Five ] =  5
cardRankToNumber[CardRank.Six  ] =  6
cardRankToNumber[CardRank.Seven] =  7
cardRankToNumber[CardRank.Eight] =  8
cardRankToNumber[CardRank.Nine ] =  9
cardRankToNumber[CardRank.Ten  ] = 10
cardRankToNumber[CardRank.Jack ] = 11
cardRankToNumber[CardRank.Queen] = 12
cardRankToNumber[CardRank.King ] = 13

const numberToCardRank: { [key: number]: CardRank } = {}
numberToCardRank[ 1] = CardRank.Ace
numberToCardRank[ 2] = CardRank.Two
numberToCardRank[ 3] = CardRank.Three
numberToCardRank[ 4] = CardRank.Four
numberToCardRank[ 5] = CardRank.Five
numberToCardRank[ 6] = CardRank.Six
numberToCardRank[ 7] = CardRank.Seven
numberToCardRank[ 8] = CardRank.Eight
numberToCardRank[ 9] = CardRank.Nine
numberToCardRank[10] = CardRank.Ten
numberToCardRank[11] = CardRank.Jack
numberToCardRank[12] = CardRank.Queen
numberToCardRank[13] = CardRank.King

function previousCardRank(currentRank: CardRank): CardRank | null {
  const rankNumber: number = cardRankToNumber[currentRank]
  return rankNumber <= 0 ? null : numberToCardRank[rankNumber - 1]
}
function nextCardRank(currentRank: CardRank): CardRank | null {
  const rankNumber: number = cardRankToNumber[currentRank]
  return rankNumber >= Object.keys(cardRankToNumber).length - 1 ? null : numberToCardRank[rankNumber + 1]
}

class Card {
  readonly suit: CardSuit
  readonly rank: CardRank

  get score(): number {
    switch(this.rank) {
      case CardRank.Ace:
        return 20
      case CardRank.Jack:
      case CardRank.Queen:
      case CardRank.King:
        return 10
      case CardRank.Ten:
        return tenScore
      default:
        return 5
    }
  }

  constructor(suit: CardSuit, rank: CardRank) { 
    this.suit = suit
    this.rank = rank
  }

  equals(other: Card): boolean {
    return this.suit === other.suit && this.rank === other.rank
  }

  static getDeck(): Card[] {
    const cards: Card[] = []

    for(const suit of Object.keys(CardSuit)) {
      for(const rank of Object.keys(CardRank)) {
        cards.push(new Card(
          CardSuit[suit as keyof typeof CardSuit],
          CardRank[rank as keyof typeof CardRank]
        ))
      }
    }

    return cards
  }
}