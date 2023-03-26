import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  messages: string[] = [];
  errors: string[] = [];
  //retain messages during route navigation?
  retainInNavigation: boolean = false;

  //Message will be cleared after 5 seconds if the second parameter (clearAfterDisplay) is true.
  //By default, it will be cleared.
  add(message: string, clearAfterDisplay: boolean = true) {
    this.messages.push(message);

    if (clearAfterDisplay) {
      setTimeout(() => {
        const index = this.messages.indexOf(message, 0);
        if (index > -1) {
          this.messages.splice(index, 1);
        }
      }, 5000);
    }
  }

  addError(error: string) {
    this.errors.push(error);
  }

  setError(error: string) {
    this.clearError();
    this.errors.push(error);
  }

  handleIDNError(errResponse) {
    let errMsg = '';
    const errStatusCode = errResponse.status;

    if (errResponse.error) {
      if (
        errStatusCode === 400 ||
        errStatusCode === 403 ||
        errStatusCode === 404 ||
        errStatusCode === 500
      ) {
        if (
          errResponse.error.messages &&
          errResponse.error.messages.length > 0 &&
          errResponse.error.messages[0].text
        ) {
          errMsg += errResponse.error.messages[0].text;
        } else if (errResponse.error.formatted_msg) {
          errMsg += errResponse.error.formatted_msg;
        }
        if (errResponse.error.detailCode) {
          errMsg += ' (Error code: ' + errResponse.error.detailCode + ')';
        } else if (errResponse.error.error_code) {
          errMsg += ' (Error code: ' + errResponse.error.error_code + ')';
        }
      } else if (errStatusCode === 429) {
        if (errResponse.error.message) {
          errMsg += errResponse.error.message;
        }
      }
    } else {
      errMsg +=
        'Error to invoke IDN API. Please contact the system adminstrator.';
    }
    // this.clearError();
    this.errors.push(errMsg);
  }

  clear() {
    this.messages = [];
  }

  clearError() {
    this.errors = [];
  }

  clearAll() {
    this.clear();
    this.clearError();
  }
}
