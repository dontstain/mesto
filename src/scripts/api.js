import {popup} from './popup.js';

export class Api {
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
      method: 'GET',
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

const serverUrl = NODE_ENV === 'development' ? 'http://praktikum.tk/cohort4' : 'https://praktikum.tk/cohort4';

export const api = new Api({
  baseUrl: serverUrl,
  headers: {
    authorization: '3ddccccc-eaef-44d5-912d-395721805785',
    'Content-Type': 'application/json'
  }
});
