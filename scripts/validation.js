
const errorsRu = {
  emptyInput: 'Это обязательное поле',
  invalidLength: 'Должно быть от 2 до 30 символов',
  notURL: 'Здесь должна быть ссылка'
}

function disableButton(button) {
    button.classList.add('popup__button_disabled');
    button.setAttribute('disabled', true);
  }
  
  function enableButton(button) {
    button.classList.remove('popup__button_disabled');
    button.removeAttribute('disabled');
  }
  
  function isFormValid(form) {
    let formValid = true;
    
    Array.from(form.elements).forEach((input) => {  
      if (!input.checkValidity()) {
        formValid = false
      }
    })
    return formValid
  }
  
  function errorMessage(input) {
    const errorSpan = document.querySelector(`#${input.name}-error`);
    
    errorSpan.classList.remove('error-message_hidden');
    if (input.type === 'url') {
      errorSpan.textContent = errorsRu.notURL
    } else {
      errorSpan.textContent = errorsRu.invalidLength
    }
    if (input.value === '') {
      errorSpan.textContent = errorsRu.emptyInput
    }
  }
  
  function clearErrorMessage(input) {
    const errorSpan = document.querySelector(`#${input.name}-error`);
    
    if (errorSpan) {
      errorSpan.textContent = '';
      errorSpan.classList.add('error-message_hidden');
    }
  }
  
  function formValidateSubmit(form) {
    const button = form.querySelector('button');
    
    if (!isFormValid(form)) {
      disableButton(button)
    } else {
      enableButton(button)
    }
  }
  
  function inputValidation(input) {
    if (!input.checkValidity()) {
      errorMessage(input);
    } else {
      clearErrorMessage(input);
    }
  }
  
  function initialFormValidation(form) {
    formValidateSubmit(form);
    
    Array.from(form.elements).forEach((input) => {
      if (input.value === '' || isFormValid(form)) {
        clearErrorMessage(input)
      }
    });
  }