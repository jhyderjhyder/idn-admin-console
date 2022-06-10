import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { BehaviorSubject, Observable, of} from 'rxjs';
import { catchError} from 'rxjs/operators';

import { User } from './../model/user';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  environmentName = '';
  apiUrl = '';

  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(private http: HttpClient) {
      this.currentUserSubject = new BehaviorSubject(JSON.parse(sessionStorage.getItem('currentUser')));
      this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
      return this.currentUserSubject.value;
  }

  private handleError<T> (operation = 'operation', errorMessage?: string, propagateAPIError?:boolean) {
    return (error: any): Observable<T> => {
      console.error(error); // log to console instead
      if (propagateAPIError) {
        throw new Error(error);
      }
      else if (error.toUpperCase() == "OK") {
        return of(error as T);
      }
      else if (errorMessage) {
        throw new Error(errorMessage);
      } 
      else {
        throw new Error('System error. Please contact system admistrator');
      }
    };
  }

  afterLogin(user: User): void {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  authenticate(user: User): any {
    let url = `https://${user.tenant}.api.identitynow.com/oauth/token?grant_type=client_credentials&client_id=${user.clientId}&client_secret=${user.clientSecret}`;
    return this.http.post(url, {}, {observe: 'response'}).pipe(
      catchError(this.handleError(`authenticate`, null, true))
    );
  }

  checkOrgAdminAccess(authUser: User): any {
    const headers = { 'Authorization': 'Bearer ' +  authUser.accessToken }
    let url = `https://${authUser.tenant}.api.identitynow.com/beta/org-config`;
    return this.http.get(url, { headers }).pipe(
      catchError(this.handleError(`checkOrgAdminAccess`, null, true))
    );
  }

  loginMock(username: string, password: string) {
      let user  = new User();
      // user.username = username;
      // user.authdata = window.btoa(username + ':' + password);
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
      return user;
  }

  logout() {
      // remove user from local storage to log user out
      sessionStorage.removeItem('currentUser');
      this.currentUserSubject.next(null);
      const url = `${this.apiUrl}/logout`;
      return this.http.post<any>(url, null);
  }
}
