import {Popup, popup} from './popup.js';
import {card} from './card.js'
import {api} from './api.js'
import {CardList} from './cardList.js';

let places;

export class HandlingEvents {
  constructor() {
    document.addEventListener('click', this);
    document.addEventListener('submit', this);
    document.addEventListener('input', this);
  }

  handleEvent(event) {
    if (event.type === 'click') {
      if (event.target.classList.contains('place-card__like-icon')) {
        card.like(event);
      }
      if (event.target.classList.contains('place-card__delete-icon')) {
        card.delete(event);
      }
      if (event.target.classList.contains('place-card__image')) {
        card.enhanceImg(event);
      }
      if (event.target.hasAttribute('data-target')) {
        const popupToOpen = new Popup(event.target.dataset.target);
      
        popupToOpen.open();
      }
      if (event.target.classList.contains('popup__close')) {
        const id = document.querySelector('.popup_is-opened').id;
        const popupToClose = new Popup(id);
      
        popupToClose.close();
      }
    }

    else if (event.type === 'submit') {
      if (event.target.classList.contains('popup__form')) {
        const id = document.querySelector('.popup_is-opened').id;
        const popupToSubmit = new Popup(id);
        
        popupToSubmit.formSubmit(event);
        switch (id) {
          case 'popupAdd':
            api.uploadCard(popupToSubmit.form.elements.name.value, popupToSubmit.form.elements.link.value)
              .then(() => api.getInitialCards())
              .then(res => places.addCard(res.pop()))
              .then(() => popupToSubmit.renderLoading(false))
              .finally(() => popupToSubmit.close(event));   
            break;
          case 'popupEdit':
            api.uploadUserInfo(popupToSubmit.userName.textContent, popupToSubmit.userAbout.textContent)
              .finally(() => popupToSubmit.close(event));
            break;
          case 'popupAvatar':
            api.uploadUserAvatar(popupToSubmit.form.elements.linkAvatar.value)
              .finally(() => popupToSubmit.close(event));
            break;
        };
      }
    }
    
    else if (event.type === 'input') {
      if (event.target.classList.contains('popup__input')) {
        popup.formValidation(event.target);
      }
    }
  }
}

api.getInitialCards()
  .then(res => {
    places = new CardList(document.querySelector('.places-list'), res);
    places.cards = res;
  });