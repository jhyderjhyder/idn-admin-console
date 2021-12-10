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

