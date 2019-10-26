class Card {
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

class CardList {
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

class Popup {
  constructor(popupId) {
    this.popupById = document.getElementById(popupId);
    
    this.userName = document.querySelector('.user-info__name');
    this.userAbout = document.querySelector('.user-info__job');
    this.userAvatar = document.querySelector('.user-info__photo');
  }
  
  getForm() {
    this.form = this.popupById.querySelector('form');
  }

  formValidation(input) {
    inputValidation(input);
    formValidateSubmit(input.parentElement);
  }

  open() {
    this.getForm();

    if (this.form) {
      if (this.form.name === 'userInfo') {
        this.form.elements.person.value = this.userName.textContent;
        this.form.elements.about.value = this.userAbout.textContent
      }
      initialFormValidation(this.form);
    }
    this.popupById.classList.add('popup_is-opened');
  }
  
  close() {
    this.popupById.classList.remove('popup_is-opened');
  }
  
  renderLoading(isLoading) {
    const popupOpened = document.querySelector('.popup_is-opened');
    const button = popupOpened.querySelector('.popup__button');

    if (isLoading) {
      button.textContent = 'Загрузка...';
    } else {
      if (popupOpened.id === 'popupAdd') {
        button.textContent = '+';
      } else {
        button.textContent = 'Сохранить';
      }
    }
  }

  updateUserInfo(objectWithNewInfo) {  
    this.userName.textContent = objectWithNewInfo.name;
    this.userAbout.textContent = objectWithNewInfo.about;
    this.userAvatar.setAttribute('style', `background-image: url(${objectWithNewInfo.avatar})`)
  }

  formSubmit(event) {    
    event.preventDefault();
    this.getForm();
    
    switch (this.popupById.id) {
      case 'popupAdd':
        this.renderLoading(true);
        api.uploadCard(this.form.elements.name.value, this.form.elements.link.value)
          .then(() => api.getInitialCards())
          .then(res => places.addCard(res.pop()))
          .then(() => this.renderLoading(false))
          .finally(() => this.close(event));   
        break;
      case 'popupEdit':
        this.userName.textContent = this.form.elements.person.value;
        this.userAbout.textContent = this.form.elements.about.value;
        api.uploadUserInfo(this.userName.textContent, this.userAbout.textContent)
          .finally(() => this.close(event));
        break;
      case 'popupAvatar':
        this.userAvatar.setAttribute('style',`background-image: url(${this.form.elements.linkAvatar.value})`);
        api.uploadUserAvatar(this.form.elements.linkAvatar.value)
          .finally(() => this.close(event));
        break;
    };
  }
}

class Api {
  constructor(options) {
    this.headers = options.headers;
    this.baseUrl = options.baseUrl;
  }

  getInitialCards() {
    return fetch(`${this.baseUrl}/cards`, {
      method: 'GET',
      headers: this.headers
    })
      .then(res => {
        if (res.ok) {
          return res.json()
        }
        return Promise.reject(`Ошибка: ${res.status}`)
      })
      .catch((err) => console.log(err))
  }

  getUserInfo() { 
    fetch(`${this.baseUrl}/users/me`, {
      methid: 'GET',
      headers: this.headers
    })
      .then(response => {
        if (response.ok) {
          return response.json()
        }
        return Promise.reject(`Ошибка: ${response.status}`)
      })
      .then(object => popup.updateUserInfo(object))
      .catch((err) => console.log(err))
  }
  
  uploadUserInfo(newName, newAbout) {
    popup.renderLoading(true);
    return fetch(`${this.baseUrl}/users/me`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify({
          name: newName,
          about: newAbout
      })
    })
      .then(res => {
        if (res.ok) {
          return res.json()
        }
        return Promise.reject(`Ошибка: ${res.status}`)
      })
      .catch((err) => console.log(err))
      .finally(() => popup.renderLoading(false));
  }
  
  uploadUserAvatar(link) {
    popup.renderLoading(true);
    return fetch(`${this.baseUrl}/users/me/avatar`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify({
        avatar: link
      })
    })
      .then(res => {
        if (res.ok) {
          return res.json()
        }
        return Promise.reject(`Ошибка: ${res.status}`)
      })
      .catch((err) => console.log(err))
      .finally(() => popup.renderLoading(false));
  }

  uploadCard(name, link) {
    return fetch(`${this.baseUrl}/cards`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        name: name,
        link: link
      })
    })
      .then(res => {
        if (res.ok) {
          return res.json()
        }
        return Promise.reject(`Ошибка: ${res.status}`)
      })
      .catch((err) => console.log(err))
  }
  
  deleteCard(cardId) {
    fetch(`${this.baseUrl}/cards/${cardId}`, {
    method: 'DELETE',
    headers: this.headers
    })
      .then(res => {
        if (res.ok) {
          return res.json()
        }
        return Promise.reject(`Ошибка: ${res.status}`)
      })
      .catch((err) => console.log(err))
  }

  putLike(cardId) {
    return fetch(`${this.baseUrl}/cards/like/${cardId}`,{
      method: 'PUT',
      headers: this.headers
    })
      .then(res => {
        if (res.ok) {
          return res.json()
        }
        return Promise.reject(`Ошибка: ${res.status}`)
      })
      .catch((err) => console.log(err))
  }

  removeLike(cardId) {
    return fetch(`${this.baseUrl}/cards/like/${cardId}`,{
      method: 'DELETE',
      headers: this.headers
    })
      .then(res => {
        if (res.ok) {
          return res.json()
        }
        return Promise.reject(`Ошибка: ${res.status}`)
      })
      .catch((err) => console.log(err))
  }

  renderLiked(card) {
    for (let i = 0; i< card.likes.length; i++) {
      if (card.likes[i]._id === "7a1c4e1b19bca0cf3c99d014") return true
    }
    return false
  }

  renderOwner(card) {
    if (card.owner._id === "7a1c4e1b19bca0cf3c99d014") return true
    return false
  }
}

class HandlingEvents {
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
      }
    }
    
    else if (event.type === 'input') {
      if (event.target.classList.contains('popup__input')) {
        popup.formValidation(event.target);
      }
    }
  }
}

const api = new Api({
  baseUrl: 'http://95.216.175.5/cohort4',
  headers: {
    authorization: '3ddccccc-eaef-44d5-912d-395721805785',
    'Content-Type': 'application/json'
  }
});

const card = new Card();
const popup = new Popup();
let places;

new HandlingEvents();

api.getUserInfo();
api.getInitialCards()
  .then(res => {
    places = new CardList(document.querySelector('.places-list'), res);
    places.cards = res;
  });