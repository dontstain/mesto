import {Card} from './card.js';

export class CardList {
  constructor(container, initialCards) {
    this.container = container;
    this.initialCards = initialCards;
    this.render();
  }

  addCard(cardObj) {
    const cardMarkup = new Card(cardObj).create();

    this.container.insertAdjacentHTML('beforeend', cardMarkup);
  }

  render() {
    this.initialCards.forEach(element => this.addCard(element));
  }
}