import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpUrlEncodingCodec} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { MessageService } from './message.service';
import { Source } from '../model/source';
import { Rule } from '../model/rule';
import { SimpleQueryCondition } from '../model/simple-query-condition';
import { AggTaskPollingStatus } from '../model/agg-task-polling-status';
import { AuthenticationService } from '../service/authentication-service.service';
import { Role } from '../model/role';

@Injectable({
  providedIn: 'root'
})

export class IDNService {

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  codec = new HttpUrlEncodingCodec;

  //Keep track of source aggregation task ID and its polling (calling IDN API to fetch Task completed status) status. 
  aggTaskPollingStatusMap = {};

  constructor(
        private http: HttpClient,
        private messageService: MessageService,
        private authenticationService: AuthenticationService) { 
  }

  startAggTaskPolling(cloudExternalID: string, taskId: string) {
    let aggTaskPollingStatus = new AggTaskPollingStatus();
    aggTaskPollingStatus.taskId = taskId;
    this.aggTaskPollingStatusMap[cloudExternalID] = aggTaskPollingStatus;
  }

  getAggTaskPolling(cloudExternalID: string): AggTaskPollingStatus {
    return this.aggTaskPollingStatusMap[cloudExternalID];
  }

  finishAggTaskPolling(cloudExternalID: string): AggTaskPollingStatus {
    let aggTaskPollingStatus: AggTaskPollingStatus  = this.aggTaskPollingStatusMap[cloudExternalID];
    aggTaskPollingStatus.completed = true; 
    return aggTaskPollingStatus;
  }

  searchMultipleAccounts(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let url = `https://${currentUser.tenant}.api.identitynow.com/beta/search-aggregations/identities?limit=0`;

    let payload = {
      "query": {
          "query": "*"
      },
      "aggregationsDsl": {
          "accounts": {
              "nested": {
                  "path": "accounts"
              },
              "aggs": {
                  "source_id": {
                      "terms": {
                          "field": "accounts.source.id",
                          "min_doc_count": 2,
                          "size": 100
                      },
                      "aggs": {
                          "identities": {
                              "terms": {
                                  "field": "_uid",
                                  "min_doc_count": 2
                              },
                              "aggs": {
                                  "accounts": {
                                      "top_hits": {}
                                  }
                              }
                          }
                      }
                  }
              }
          }
      }
    };

    return this.http.post(url, payload, this.httpOptions).pipe(
      catchError(this.handleError(`MultipleAccountsComponent`))
    );
  }

  searchIdentities(identityId: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let url = `https://${currentUser.tenant}.api.identitynow.com/beta/search/identities`;

    let payload = {
      "query": {
          "query": `id:${identityId}`
      }
    };

    return this.http.post(url, payload, this.httpOptions).pipe(
      catchError(this.handleError(`searchIdentities`))
    );
  }

  searchAggregationSources(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let url = `https://${currentUser.tenant}.api.identitynow.com/beta/sources`;

    return this.http.get(url, this.httpOptions).pipe(
      catchError(this.handleError(`getAggregationSources`))
    );
  }

  refreshAllRoles(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let url = `https://${currentUser.tenant}.api.identitynow.com/cc/api/role/refresh`;

    return this.http.post(url, null, { responseType: 'text' }).pipe(
      catchError(this.handleError(`refreshAllRoles`))
    );
  }

  getAllRoles(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let url = `https://${currentUser.tenant}.api.identitynow.com/beta/roles`;

    return this.http.get(url, this.httpOptions).pipe(
      catchError(this.handleError(`getAllRoles`))
    );
  }

  updateRoleOwner(role: Role): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let url = `https://${currentUser.tenant}.api.identitynow.com/beta/roles/${role.id}`;
    
    let myHttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json-patch+json'
      })
    };

    let payload = [
      {
          "op": "replace",
          "path": "/owner",
          "value": {
              "type": "IDENTITY",
              "id": null,
              "name": null
          }
      }
    ];

    payload[0].value.id = role.newOwner.accountId;
    payload[0].value.name = role.newOwner.displayName;

    return this.http.patch(url, payload, myHttpOptions);
  }

  updateRole(role: Role, path: string, enable: boolean): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let url = `https://${currentUser.tenant}.api.identitynow.com/beta/roles/${role.id}`;
    
    let myHttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json-patch+json'
      })
    };

    let payload = [
      {
          "op": "replace",
          "path": `/${path}`,
          "value": `${enable}`
      }
    ];

    return this.http.patch(url, payload, myHttpOptions);
  }

  deleteRole(role: Role): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let url = `https://${currentUser.tenant}.api.identitynow.com/beta/roles/${role.id}`;
    
    let myHttpOptions = {
      headers: new HttpHeaders({
      })
    };
    
    return this.http.delete(url, myHttpOptions);
  }

  getAggregationSchedules(cloudExternalID: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let url = `https://${currentUser.tenant}.api.identitynow.com/cc/api/source/getAggregationSchedules/${cloudExternalID}`;
    return this.http.get(url);
    /*
    return this.http.get(url).pipe(
      catchError(this.handleError(`getAggregationSchedules`))
    );
    */
  }

  getEntitlementAggregationSchedules(cloudExternalID: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let url = `https://${currentUser.tenant}.api.identitynow.com/cc/api/source/getEntitlementAggregationSchedules/${cloudExternalID}`;
    return this.http.get(url);
    /*
    return this.http.get(url).pipe(
      catchError(this.handleError(`getEntitlementAggregationSchedules`))
    );
    */
  }

  updateAggregationSchedules(source: Source, enable: boolean): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let encodedCronExp = this.codec.encodeValue(source.accountAggCronExp);
    encodedCronExp = encodedCronExp.replace('?', '%3F');
    let url = `https://${currentUser.tenant}.api.identitynow.com/cc/api/source/scheduleAggregation/${source.cloudExternalID}?enable=${enable}&cronExp=${encodedCronExp}`;
    
    let myHttpOptions = {
      headers: new HttpHeaders({
      })
    };
    return this.http.post(url, null, myHttpOptions);
  }

  updateEntAggregationSchedules(source: Source, enable: boolean): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let encodedCronExp = this.codec.encodeValue(source.entAggCronExp);
    encodedCronExp = encodedCronExp.replace('?', '%3F');
    let url = `https://${currentUser.tenant}.api.identitynow.com/cc/api/source/scheduleEntitlementAggregation/${source.cloudExternalID}?enable=${enable}&cronExp=${encodedCronExp}`;
    
    let myHttpOptions = {
      headers: new HttpHeaders({
      })
    };
    return this.http.post(url, null, myHttpOptions);
  }

  searchAccounts(query: SimpleQueryCondition): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let url = `https://${currentUser.tenant}.api.identitynow.com/beta/search/`;

    let payload = {
      "query": {
          "query": `${query.attribute}:${query.value}`
      }
    };

    return this.http.post(url, payload, this.httpOptions).pipe(
      catchError(this.handleError(`searchAccounts`))
    );
  }

  updateSourceOwner(source: Source): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let url = `https://${currentUser.tenant}.api.identitynow.com/beta/sources/${source.id}`;
    
    let myHttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json-patch+json'
      })
    };

    let payload = [
      {
          "op": "replace",
          "path": "/owner",
          "value": {
              "type": "IDENTITY",
              "id": null,
              "name": null
          }
      }
    ];

    payload[0].value.id = source.newOwner.accountId;
    payload[0].value.name = source.newOwner.displayName;

    return this.http.patch(url, payload, myHttpOptions);
  }

  aggregateSourceOwner(cloudExternalID: string, formData: FormData): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let url = `https://${currentUser.tenant}.api.identitynow.com/cc/api/source/loadAccounts/${cloudExternalID}`;
    
    let myHttpOptions = {
      headers: new HttpHeaders({
      })
    };
    
    return this.http.post(url, formData, myHttpOptions);
  }

  getAccountAggregationStatus(taskId: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let url = `https://${currentUser.tenant}.api.identitynow.com/beta/account-aggregations/${taskId}/status`;

    return this.http.get(url).pipe(
      catchError(this.handleError(`getAccountAggregationStatus`))
    );
  }

  getConnectorRules(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let url = `https://${currentUser.tenant}.api.identitynow.com/beta/connector-rules`;

    return this.http.get(url, this.httpOptions);
  }

  getConnectorRuleById(ruleId: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let url = `https://${currentUser.tenant}.api.identitynow.com/beta/connector-rules/${ruleId}`;

    return this.http.get(url, this.httpOptions);
  }

  importConnectorRule(rule: Rule): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let url = `https://${currentUser.tenant}.api.identitynow.com/beta/connector-rules`;
    
    let myHttpOptions = {
      headers: new HttpHeaders({
      })
    };

    let payload = {
      "name": `${rule.name}`,
      "type": `${rule.type}`,
      "sourceCode": {
        "version": "1.0",
        "script": `${rule.script}`
      },
      "description": `${rule.description}`,
      "attributes": {}
    };
    
    if (rule.attributes) {
      payload.attributes = rule.attributes;
    }
    return this.http.post(url, payload, myHttpOptions);
  }

  updateConnectorRule(rule: Rule): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let url = `https://${currentUser.tenant}.api.identitynow.com/beta/connector-rules/${rule.id}`;
    
    let myHttpOptions = {
      headers: new HttpHeaders({
      })
    };

    let payload = {
      "name": `${rule.name}`,
      "type": `${rule.type}`,
      "id": `${rule.id}`,
      "sourceCode": {
        "version": "1.0",
        "script": `${rule.script}`
      },
      "description": `${rule.description}`,
      "attributes": {}
    };

    if (rule.attributes) {
      payload.attributes = rule.attributes;
    }

    return this.http.put(url, payload, myHttpOptions);
  }

  deleteConnectorRule(rule: Rule): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let url = `https://${currentUser.tenant}.api.identitynow.com/beta/connector-rules/${rule.id}`;
    
    let myHttpOptions = {
      headers: new HttpHeaders({
      })
    };
    
    return this.http.delete(url, myHttpOptions);
  }


  getOrgConfig(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let url = `https://${currentUser.tenant}.api.identitynow.com/beta/org-config`;

    return this.http.get(url, this.httpOptions);
  }

  getValidTimeZones(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let url = `https://${currentUser.tenant}.api.identitynow.com/beta/org-config/valid-time-zones`;

    return this.http.get(url, this.httpOptions);
  }

  updateOrgTimeConfig(timeZoneValue: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let url = `https://${currentUser.tenant}.api.identitynow.com/beta/org-config`;
    
    let myHttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json-patch+json'
      })
    };

    let payload = [
      {
          "op": "replace",
          "path": "/timeZone",
          "value": `${timeZoneValue}`
      }
    ];

    return this.http.patch(url, payload, myHttpOptions);
  }

   /** Log a HeroService message with the MessageService */
   private log(message: string) {
     this.messageService.add(`${message}`);
   }

   private logError(error: string) {
      this.messageService.addError(`${error}`);
   }

   /**
    * Handle Http operation that failed.
    * Let the app continue.
    * @param operation - name of the operation that failed
    * @param result - optional value to return as the observable result
    */
   private handleError<T> (operation = 'operation', result?: T, logErr:boolean = true) {
     return (error: any): Observable<T> => {

       // TODO: send the error to remote logging infrastructure
       console.error(error); // log to console instead

       // TODO: better job of transforming error for user consumption
       if (logErr) {
          this.logError(`${operation} failed: ${error.message}`);
       }
       // Let the app keep running by returning an empty result.
       return of(result as T);
     };
   }

   private handleException<T> (operation = 'operation', errorMessage?: string , propagateAPIError?:boolean) {
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

      // return of(error as T);
    };
  }

}
