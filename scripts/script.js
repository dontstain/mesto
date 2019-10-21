class Card {
  constructor(name, link) {
    this.cardMarkup = this.create(name, link);
  };
  
  like(event) {
    event.target.classList.toggle('place-card__like-icon_liked');
  }

  remove(event) {
    event.target.parentElement.parentElement.remove();
  }

  create(nameValue, linkValue) {
    return `
    <div class="place-card">
      <div class="place-card__image" style="background-image: url(${linkValue})" data-target="popupImg">
        <button class="place-card__delete-icon"></button>
      </div>
      <div class="place-card__description">
        <h3 class="place-card__name">${nameValue}</h3>
        <button class="place-card__like-icon"></button>
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
    // this.cards = [];
    this.render();
  }

  addCard(name, link) {
    const {cardMarkup} = new Card(name, link);

    // this.cards.push(cardElement);
    this.container.insertAdjacentHTML('beforeend', cardMarkup);
  }

  render() {
    this.initialCards.forEach(element => this.addCard(element.name, element.link));
  }
}

class Popup {
  constructor(popupId) {
    this.popupById = document.getElementById(popupId);
    
    this.userName = document.querySelector('.user-info__name');
    this.userAbout = document.querySelector('.user-info__job');
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
  
  formSubmit(event) {    
    event.preventDefault();
    this.getForm();
    
    switch (this.popupById.id) {
      case 'popupAdd':
        places.addCard(this.form.elements.name.value, this.form.elements.link.value);
        api.uploadCard(this.form.elements.name.value, this.form.elements.link.value)
          .finally(() => this.close(event));   
        // this.close(event);     
        break;
      case 'popupEdit':
        this.userName.textContent = this.form.elements.person.value;
        this.userAbout.textContent = this.form.elements.about.value;
        api.uploadUserInfo(this.userName.textContent, this.userAbout.textContent)
          .finally(() => this.close(event));
        break;
    };
    // this.close(event); 
  }
}

class Api {
  constructor(options) {
    this.headers = options.headers;
    this.baseUrl = options.baseUrl;
  }

  updateUserInfo(objectWithNewInfo) {
    const userName = document.querySelector('.user-info__name');
    const userAbout = document.querySelector('.user-info__job');
    const userAvatar = document.querySelector('.user-info__photo');
  
    userName.textContent = objectWithNewInfo.name;
    userAbout.textContent = objectWithNewInfo.about;
    userAvatar.setAttribute('style', `background-image: url(${objectWithNewInfo.avatar})`)
  }

  getInitialCards() {
    fetch(`${this.baseUrl}/cards`, {
      method: 'get',
      headers: this.headers
    })
    .then(res => {
      if (res.ok) {
        return res.json()
      }
      return Promise.reject(`Ошибка: ${res.status}`)
    })
    .then(res => {
      places = new CardList(document.querySelector('.places-list'), res);
      places.cards = res;
      // console.log(places);
    })
    .catch((err) => console.log(err))
  }

  getUserInfo() { 
    fetch(`${this.baseUrl}/users/me`, {
      methid: 'get',
      headers: this.headers
    })
      .then(response => {
        if (response.ok) {
          return response.json()
        }
        return Promise.reject(`Ошибка: ${response.status}`)
      })
      .then(object => this.updateUserInfo(object))
      .catch((err) => console.log(err))
  }
  
  uploadUserInfo(newName, newAbout) {
    this.renderLoading(true);
    return fetch(`${this.baseUrl}/users/me`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify({
          name: newName,
          about: newAbout
      })
    })
    .finally(() => this.renderLoading(false));
  }
  
  uploadCard(name, link) {
    // this.renderLoading(true);
    return fetch(`${this.baseUrl}/cards`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        name: name,
        link: link
      })
    })
    .then((res) => console.log(res))
    // .finally(() => this.renderLoading(false));
  }
  
  deleteCard(cardId) {
    fetch(`${this.baseUrl}/cards/${cardId}`, {
    method: 'DELETE',
    headers: this.headers
    })
    .then(res => res.json());
  }

  renderLoading(isLoading) {
    const popupOpened = document.querySelector('.popup_is-opened');
    const button = popupOpened.querySelector('.popup__button');

    if (isLoading) {
      button.textContent = 'Загрузка...';
    } else {
      if (popupOpened.id === 'popupAdd') {
        button.textContent = '+';
      }
      if (popupOpened.id === 'popupEdit') {
        button.textContent = 'Сохранить'
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


let places;
const card = new Card();
const popup = new Popup();


document.addEventListener('click', function(event) {
  const target = event.target;
  if (target.classList.contains('place-card__like-icon')) {
    card.like(event);
  }
  if (target.classList.contains('place-card__delete-icon')) {
    card.remove(event);
  }
  if (target.classList.contains('place-card__image')) {
    card.enhanceImg(event);
  }
  if (target.hasAttribute('data-target')) {
    const popupToOpen = new Popup(target.dataset.target);

    popupToOpen.open();
  }
  if (target.classList.contains('popup__close')) {
    const popupToClose = new Popup(document.querySelector('.popup_is-opened').id);

    popupToClose.close();
  }
});

document.addEventListener('submit', function(event) {
  if (event.target.classList.contains('popup__form')) {
    const id = document.querySelector('.popup_is-opened').id;
    const popupToSubmit = new Popup(id);
    
    popupToSubmit.formSubmit(event);
  }
})

document.addEventListener('input', function(event) {
  if (event.target.classList.contains('popup__input')) {
    popup.formValidation(event.target);
  }
})


api.getUserInfo();
api.getInitialCards();
function show() {
  // places.initialCards.forEach(() => {
  //   if
  // })
  console.log(places)
}
setTimeout(show, 1000);
// function deleteCards(id) {
//     fetch(`http://95.216.175.5/cohort4/cards/5da9ceb3a05fd2001fa${id.toString(16)}`, {
//     method: 'delete',
//     headers: {
//       authorization: '3ddccccc-eaef-44d5-912d-395721805785',
//     }
//   })
//     .then((res) => {
//       if (!res.ok) return
//       deleteCards(id+1);
//     });
// }
// deleteCards(301478);
// api.deleteCard('5dab3fada05fd2001fa4bef9');
// api.uploadCard('asd','https://images.unsplash.com/photo-1567720359666-1cf6be3d5fa3?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=633&q=80');

// 7a1c4e1b19bca0cf3c99d014 

/***
 * Здравствуйте
 * Правильно что используете 
 *     this.container.insertAdjacentHTML('beforeend', cardMarkup);
 * Хорошая практика
 * 
 * Хороший класс API кроме метода   renderLoading(isLoading) и updateUserInfo(objectWithNewInfo) они всё портит и их там не должно быть
 * API работает только в с внешними ресурсами. Работу с DOM он не ведёт
 * 
 * Молодцы что используете шаблонизатор при создании карточки
 * 
 * Плохо что создаёте карточку в конструкторе класса Card это плохая практика
 * 
 * Можно лучше. Надо разделать функцию и слушатель, допустим здесь 
 * document.addEventListener('submit', function(event) {
 * 
 * validation.js хорошо бы что бы это был класс
 * 
 * лучше не так 
 * new Popup(document.querySelector('.popup_is-opened').id);

 * а вот так 
 * const id = document.querySelector('.popup_is-opened').id;
 * new Popup(id);
 * 
 * Приятная работа. Работа принимается
 * 
 */