import {inputValidation, initialFormValidation, formValidateSubmit} from './validation.js';

export class Popup {
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
        break;
      case 'popupEdit':
        this.userName.textContent = this.form.elements.person.value;
        this.userAbout.textContent = this.form.elements.about.value;
        break;
      case 'popupAvatar':
        this.userAvatar.setAttribute('style',`background-image: url(${this.form.elements.linkAvatar.value})`);
        break;
    };
  }
}

export const popup = new Popup();