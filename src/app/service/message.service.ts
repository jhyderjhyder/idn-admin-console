import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

    messages: string[] = [];
    errors: string[] = [];
    //retain messages during route navigation?
    retainInNavigation: boolean = false;

    add(message: string) {
      this.messages.push(message);
    }

    addError(error: string) {
      this.errors.push(error);
    }

    setError(error: string) {
      this.clearError();
      this.errors.push(error);
    }

    handleIDNError(errResponse) {
      let errMsg = "";
      if (errResponse.error) {
        if (errResponse.error.messages && errResponse.error.messages.length > 0 && errResponse.error.messages[0].text) {
          errMsg += "Error message: " + errResponse.error.messages[0].text;
        }
        if (errResponse.error.detailCode) {
          errMsg += " (Error code: " + errResponse.error.detailCode + ")";
        }
      } else {
        errMsg += "Error to invoke IDN API. Please contact the system adminstrator.";
      }
      this.clearError();
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

