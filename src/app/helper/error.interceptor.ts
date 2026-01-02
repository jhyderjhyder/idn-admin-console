import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

import { AuthenticationService } from '../service/authentication-service.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authenticationService: AuthenticationService,
    private route: Router
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError(err => {
        if (
          err.status === 401 &&
          !err.url.startsWith('https://api.github.com/repos/') //Hack for Version Check error since GitHub API was throwing random 401 Bad Credentials and Logging the user out due to this
        ) {
          // auto logout if 401 response returned from api
          this.authenticationService.logout();
          this.route.navigate(['/login']);
        }

        // const error = err.error.message || err.statusText;
        return throwError(err);
      })
    );
  }
}
