import {api} from './api.js';

export class Card {
  constructor(cardObj) {
    this.card = cardObj;
  };
  
  like(event) {
    const card = event.target.parentElement.parentElement.parentElement;
    const likeButton = event.target;

    if (likeButton.classList.contains('place-card__like-icon_liked')) {
      likeButton.classList.remove('place-card__like-icon_liked');      

      api.removeLike(card.getAttribute('data-id'))
        .then(resp => likeButton.nextElementSibling.textContent = resp.likes.length);
    } else {
      likeButton.classList.add('place-card__like-icon_liked');
      
      api.putLike(card.getAttribute('data-id'))
        .then(resp => likeButton.nextElementSibling.textContent = resp.likes.length);
    }
  }

  delete(event) {
    const card = event.target.parentElement.parentElement;

    if (window.confirm('Вы действительно хотите удалить эту карточку?')) {
      card.remove();
      api.deleteCard(card.getAttribute('data-id'));
    }
  }

  create() {
    return `
    <div class="place-card" data-id="${this.card._id}">
      <div class="place-card__image" style="background-image: url(${this.card.link})" data-target="popupImg">
        ${api.renderOwner(this.card)? `<button class="place-card__delete-icon"></button>` :``}
      </div>
      <div class="place-card__description">
        <h3 class="place-card__name">${this.card.name}</h3>
        <div class="place-card__like-container">
          <button class="place-card__like-icon ${api.renderLiked(this.card)? 'place-card__like-icon_liked':''}"></button>
          <p class="place-card__number-of-likes">${this.card.likes.length}</p>
        </div>
      </div>
    </div> 
    `;
  }

  enhanceImg(event) {
    const enhancedImg = document.querySelector('.popup__enhanced-img');
    const placeCardStyle = event.target.getAttribute('style');
    if (!placeCardStyle) return;

    enhancedImg.setAttribute('src', placeCardStyle.substr(placeCardStyle.indexOf('(') + 1, placeCardStyle.indexOf(')') - placeCardStyle.indexOf('(') - 1));
  }
}

export const card = new Card();