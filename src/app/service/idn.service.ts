import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpUrlEncodingCodec,
} from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { MessageService } from './message.service';
import { Source } from '../model/source';
import { Rule } from '../model/rule';
import { SimpleQueryCondition } from '../model/simple-query-condition';
import { AggTaskPollingStatus } from '../model/agg-task-polling-status';
import { AuthenticationService } from '../service/authentication-service.service';
import { Role } from '../model/role';
import { AccessProfile } from '../model/accessprofile';
import { PAT } from '../model/pat';
import { IdentityProfile } from '../model/identity-profile';
import { IdentityAttribute } from '../model/identity-attribute';
import { Transform } from '../model/transform';
import { PageResults } from '../model/page-results';
import { IdentityPreview } from '../model/identity-preview';
import { RevokeRole } from '../model/revokeRole';

@Injectable({
  providedIn: 'root',
})
export class IDNService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  codec = new HttpUrlEncodingCodec();

  //Keep track of source aggregation task ID and its polling (calling IDN API to fetch Task completed status) status.
  aggTaskPollingStatusMap = {};

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private authenticationService: AuthenticationService
  ) {}

  startAggTaskPolling(cloudExternalID: string, taskId: string) {
    const aggTaskPollingStatus = new AggTaskPollingStatus();
    aggTaskPollingStatus.taskId = taskId;
    this.aggTaskPollingStatusMap[cloudExternalID] = aggTaskPollingStatus;
  }

  getAggTaskPolling(cloudExternalID: string): AggTaskPollingStatus {
    return this.aggTaskPollingStatusMap[cloudExternalID];
  }

  finishAggTaskPolling(cloudExternalID: string): AggTaskPollingStatus {
    const aggTaskPollingStatus: AggTaskPollingStatus =
      this.aggTaskPollingStatusMap[cloudExternalID];
    aggTaskPollingStatus.completed = true;
    return aggTaskPollingStatus;
  }
  /*############################################
API's to sunset #16
###############################################
*/

  aggregateSourceOwner(
    cloudExternalID: string,
    payload: object
  ): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/sources/${cloudExternalID}/load-accounts`;

    const myHttpOptions = {
      headers: new HttpHeaders({}),
    };

    //replacement api/beta/import-accounts
    //https://sailpoint.api.identitynow.com/beta/source{id}/load-accounts
    return this.http.post(url, payload, myHttpOptions);
  }

  /**
   * Used by the rest source.  Not sure when this will have a new solution
   * source-reset-component.ts
   * @param cloudExternalID
   * @returns
   */
  getSourceCCApi(cloudExternalID: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/sources/${cloudExternalID}`;
    return this.http.get(url);
  }

  resetSource(cloudExternalID: string, skipType: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/sources/${cloudExternalID}/remove-accounts/`;

    const myHttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
    };

    let payload = null;

    if (skipType != null) {
      payload = 'skip=' + `${skipType}`;
    }

    return this.http.post(url, payload, myHttpOptions);
  }

  resetSourceEnt(cloudExternalID: string, skipType: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/entitlements/reset/sources/${cloudExternalID}`;

    const myHttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
    };

    let payload = null;

    if (skipType != null) {
      payload = 'skip=' + `${skipType}`;
    }

    return this.http.post(url, payload, myHttpOptions);
  }

  getAggregationSchedules(cloudExternalID: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/cc/api/source/getAggregationSchedules/${cloudExternalID}`;
    return this.http.get(url);
  }

  getEntitlementAggregationSchedules(cloudExternalID: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/cc/api/source/getEntitlementAggregationSchedules/${cloudExternalID}`;
    return this.http.get(url);
  }

  updateAggregationSchedules(source: Source, enable: boolean): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let encodedCronExp = this.codec.encodeValue(source.accountAggCronExp);
    encodedCronExp = encodedCronExp.replace(/'?'/g, '%3F');
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/cc/api/source/scheduleAggregation/${source.cloudExternalID}?enable=${enable}&cronExp=${encodedCronExp}`;

    const myHttpOptions = {
      headers: new HttpHeaders({}),
    };
    return this.http.post(url, null, myHttpOptions);
  }

  updateEntAggregationSchedules(
    source: Source,
    enable: boolean
  ): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let encodedCronExp = this.codec.encodeValue(source.entAggCronExp);
    encodedCronExp = encodedCronExp.replace(/'?'/g, '%3F');
    const url = `https://${currentUser.tenant}.
                  api.${currentUser.domain}/cc/api/source/scheduleEntitlementAggregation/
                  ${source.cloudExternalID}?enable=${enable}&cronExp=${encodedCronExp}`;

    const myHttpOptions = {
      headers: new HttpHeaders({}),
    };
    return this.http.post(url, null, myHttpOptions);
  }

  refreshIdentityProfilev1(profileId: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/cc/api/profile/refresh/${profileId}`;

    const myHttpOptions = {
      headers: new HttpHeaders({}),
    };

    return this.http.post(url, null, myHttpOptions);
  }

  refreshSingleIdentity(identityId: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/identities/process`;

    const payload = {
      identityIds: [identityId],
    };

    return this.http.post(url, payload, this.httpOptions);
  }

  syncSingleIdentity(identityId: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/identities/${identityId}/synchronize-attributes`;
    return this.http.post(url, this.httpOptions);
  }

  getV2IdentityID(alias: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v2/identities/${alias}`;

    return this.http.get(url, this.httpOptions);
  }

  revokeAdminPermission(cloudId: string, permission: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/cc/api/user/updatePermissions?ids=${cloudId}&isAdmin=0&adminType=${permission}`;

    return this.http.post(url, null);
  }

  /*
############################
Supported API's
############################
*/

  updateProfilePriorityv1(profile: IdentityProfile): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/identity-profiles/${profile.id}`;

    const payload = [
      {
        op: `replace`,
        path: `/priority`,
        value: profile.priority,
      },
    ];
    const myHttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json-patch+json',
      }),
    };

    return this.http.patch(url, payload, myHttpOptions);
  }
  getAllIdentityAttributes(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/identity-attributes`;

    return this.http
      .get(url, this.httpOptions)
      .pipe(catchError(this.handleError(`getAllIdentityAttributes`)));
  }

  updateAttributeIndex(attribute: IdentityAttribute): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/identity-attributes/${attribute.name}`;

    const payload = {
      displayName: attribute.displayName,
      name: attribute.name,
      searchable: attribute.searchable,
      sources: attribute.sources,
      type: attribute.type,
    };

    return this.http.put(url, payload);
  }
  getIdentityProfiles(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/identity-profiles`;

    return this.http
      .get(url, this.httpOptions)
      .pipe(catchError(this.handleError(`getAllIdentityProfilesv1`)));
  }

  searchMultipleAccounts(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/search/aggregate`;

    const payload = {
      query: {
        query: '*',
      },
      indices: ['identities'],
      aggregationsDsl: {
        accounts: {
          nested: {
            path: 'accounts',
          },
          aggs: {
            source_id: {
              terms: {
                field: 'accounts.source.id',
                min_doc_count: 2,
                size: 65536,
              },
              aggs: {
                identities: {
                  terms: {
                    field: '_id',
                    min_doc_count: 2,
                    size: 65536,
                  },
                  aggs: {
                    accounts: {
                      top_hits: {},
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    return this.http
      .post(url, payload, this.httpOptions)
      .pipe(catchError(this.handleError(`MultipleAccountsComponent`)));
  }

  searchIdentities(identityId: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/search/identities`;

    const payload = {
      query: {
        query: `id:${identityId}`,
      },
    };

    return this.http.post(url, payload, this.httpOptions);
  }

  updateSource(rawFormData, primaryKeySource): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url =
      `https://${currentUser.tenant}.api.${currentUser.domain}/v3/sources/` +
      primaryKeySource;

    const myHttpOptions = {
      headers: new HttpHeaders({}),
      'Content-Type': 'application/json',
    };
    // const data = JSON.parse(rawFormData);
    return this.http.put(url, rawFormData, myHttpOptions);
  }

  updateProvisioningPlan(rawFormData, primaryKeySource): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const childURL =
      `/v3/sources/` + primaryKeySource + `/provisioning-policies/bulk-update`;
    const url =
      `https://${currentUser.tenant}.api.${currentUser.domain}` + childURL;

    const myHttpOptions = {
      headers: new HttpHeaders({}),
      'Content-Type': 'application/json',
    };
    // const data = JSON.parse(rawFormData);
    return this.http.post(url, rawFormData, myHttpOptions);
  }

  getAllSources(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/sources?sorters=name`;

    return this.http.get(url, this.httpOptions).pipe(
      catchError(error => {
        if (error.status === 429) {
          console.warn('Rate limited. Retrying in 2 seconds...');
          this.sleep(2000);
          return this.getAllSources();
        } else {
          catchError(this.handleError(`getAllSources`));
        }
      })
    );
  }

  getAllSourcesPaged(page: PageResults, preFilter: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let filter = '';
    if (preFilter) {
      filter = '&filters=(name co "' + preFilter + '")';
    }
    console.log(filter);
    const url =
      `https://${currentUser.tenant}.api.${currentUser.domain}/v3/sources?sorters=name&count=true&limit=` +
      page.limit +
      '&offset=' +
      page.offset +
      filter;
    console.log(url);
    return this.http.get(url, { observe: 'response' }).pipe(
      catchError(error => {
        if (error.status === 429) {
          console.warn('Rate limited. Retrying in 2 seconds...');
          this.sleep(2000);
          return this.getAllSourcesPaged(page, preFilter);
        } else {
          catchError(this.handleError(`getAllSourcesPaged`));
        }
      })
    );
  }

  getAllVAClusters(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/managed-clusters`;

    return this.http
      .get(url, this.httpOptions)
      .pipe(catchError(this.handleError(`getAllVaClusters`)));
  }

  getClusterDetails(sourceId: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/managed-clusters/${sourceId}/status?type=VA`;

    return this.http
      .get(url, this.httpOptions)
      .pipe(catchError(this.handleError(`getClusterDetails`)));
  }

  getSource(sourceId: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/sources/${sourceId}`;

    return this.http
      .get(url, this.httpOptions)
      .pipe(catchError(this.handleError(`getAggregationSources`)));
  }

  getSourceTest(sourceId: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/sources/${sourceId}/connector/test-configuration`;

    return this.http.post(url, this.httpOptions).pipe(
      catchError(error => {
        if (error.status === 429) {
          console.warn('Rate limited. Retrying in 2 seconds...');
          this.sleep(1000);
          return this.getSourceTest(sourceId);
        } else {
          catchError(this.handleError(`getSourceTest`));
        }
      })
    );
  }

  getSourceV3Api(cloudExternalID: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/sources/${cloudExternalID}`;
    return this.http.get(url).pipe(
      catchError(error => {
        if (error.status === 429) {
          console.warn('Rate limited. Retrying in 2 seconds...');
          this.sleep(2000);
          return this.getSourceV3Api(cloudExternalID);
        } else {
          catchError(this.handleError(`getSourceV3Api`));
        }
      })
    );

    /*
    return this.http.get(url).pipe(
      catchError(this.handleError(`getAggregationSchedules`))
    );
    */
  }

  getTaskAggDetails(sourceId: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/task-status?count=true&filters=sourceId eq"${sourceId}"&sorters=-created`;

    return this.http.get(url).pipe(
      catchError(error => {
        if (error.status === 429) {
          console.warn('Rate limited. Retrying in 2 seconds...');
          this.sleep(2000);
          return this.getTaskAggDetails(sourceId);
        } else {
          catchError(this.handleError(`getSourceV3Api`));
        }
      })
    );
  }

  getTaskStatus(compleationStatus: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/task-status?count=true&filters=completionStatus eq"${compleationStatus}"&sorters=-created`;
    if (compleationStatus != null) {
    } else {
      url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/task-status/pending-tasks`;
    }

    return this.http.get(url).pipe(
      catchError(error => {
        if (error.status === 429) {
          console.warn('Rate limited. Retrying in 2 seconds...');
          this.sleep(2000);
          return this.getTaskStatus(compleationStatus);
        } else {
          catchError(this.handleError(`getSourceV3Api`));
        }
      })
    );
  }

  endTask(stringTaskID: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/task-status/${stringTaskID}`;
    const data = [
      {
        op: 'replace',
        path: '/completionStatus',
        value: 'Error',
      },
      {
        op: 'replace',
        path: '/completed',
        value: '2024-01-01T01:00:01.166Z',
      },
    ];

    const myHttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json-patch+json',
      }),
    };

    return this.http.patch(url, data, myHttpOptions).pipe(
      catchError(error => {
        if (error.status === 429) {
          console.warn('Rate limited. Retrying in 2 seconds...');
          this.sleep(2000);
          return this.getTaskStatus(stringTaskID);
        } else {
          catchError(this.handleError(`getSourceV3Api`));
        }
      })
    );
  }

  getSourceV3ProvisioningPolicy(
    v3ApplicationID: string,
    type: string
  ): Observable<any> {
    let apiVersion = 'v3';
    if (type == 'attribute-sync-config') {
      apiVersion = 'beta';
    }
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/${apiVersion}/sources/${v3ApplicationID}/${type}`;
    return this.http.get(url);
  }

  getTotalRolesCount(): Observable<number> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/roles?limit=1&count=true`;

    return this.http.get(url, { observe: 'response' }).pipe(
      map(response => response.headers.get('X-Total-Count')),
      map(totalCount => parseInt(totalCount, 10)),
      catchError(error => throwError(error))
    );
  }

  getAllRoles(offset: number, limit: number, options?: any): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/roles?offset=${offset}&limit=${limit}`;

    return this.http
      .get(url, {
        ...this.httpOptions,
        ...options,
      })
      .pipe(
        catchError(error => {
          if (error.status === 429) {
            console.warn('Rate limited. Retrying in 2 seconds...');
            return of(null);
          } else {
            console.error(error);
            return throwError(error);
          }
        })
      );
  }

  getRoleIdentityCount(role: Role): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/roles/${role.id}/assigned-identities?limit=1&count=true`;

    return this.http
      .get(url, { observe: 'response' })
      .pipe(catchError(this.handleError(`getRoleIdentityCount`)));
  }

  updateRoleOwner(role: Role): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/roles/${role.id}`;

    const myHttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json-patch+json',
      }),
    };

    const payload = [
      {
        op: 'replace',
        path: '/owner',
        value: {
          type: 'IDENTITY',
          id: null,
          name: null,
        },
      },
    ];

    payload[0].value.id = role.newOwner.accountId;
    payload[0].value.name = role.newOwner.displayName;

    return this.http.patch(url, payload, myHttpOptions);
  }

  updateRole(role: Role, path: string, enable: boolean): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/roles/${role.id}`;

    const myHttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json-patch+json',
      }),
    };

    const payload = [
      {
        op: 'replace',
        path: `/${path}`,
        value: `${enable}`,
      },
    ];

    return this.http.patch(url, payload, myHttpOptions);
  }

  duplicateRole(role: Role, newRoleName: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/roles`;

    const payload = {
      name: `${newRoleName}`,
      description: `${role.description}`,
      owner: null,
      membership: null,
    };

    payload.owner = JSON.parse(role.duplicateOwner);
    payload.membership = JSON.parse(role.membership);

    return this.http.post(url, payload);
  }

  deleteRole(role: Role): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/roles/${role.id}`;

    const myHttpOptions = {
      headers: new HttpHeaders({}),
    };

    return this.http.delete(url, myHttpOptions);
  }

  getAllAccessProfiles(
    offset: number,
    limit: number,
    options?: any
  ): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/access-profiles?offset=${offset}&limit=${limit}`;

    return this.http
      .get(url, {
        ...this.httpOptions,
        ...options,
      })
      .pipe(
        catchError(error => {
          if (error.status === 429) {
            console.warn('Rate limited. Retrying in 2 seconds...');
            return of(null);
          } else {
            console.error(error);
            return throwError(error);
          }
        })
      );
  }

  updateAccessProfileOwner(accessProfile: AccessProfile): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/access-profiles/${accessProfile.id}`;

    const myHttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json-patch+json',
      }),
    };

    const payload = [
      {
        op: 'replace',
        path: '/owner',
        value: {
          type: 'IDENTITY',
          id: null,
          name: null,
        },
      },
    ];

    payload[0].value.id = accessProfile.newOwner.accountId;
    payload[0].value.name = accessProfile.newOwner.displayName;

    return this.http.patch(url, payload, myHttpOptions);
  }

  updateAccessProfile(
    accessProfile: AccessProfile,
    path: string,
    enable: boolean
  ): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/access-profiles/${accessProfile.id}`;

    const myHttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json-patch+json',
      }),
    };

    const payload = [
      {
        op: 'replace',
        path: `/${path}`,
        value: `${enable}`,
      },
    ];

    return this.http.patch(url, payload, myHttpOptions);
  }

  deleteAccessProfile(accessProfile: AccessProfile): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/access-profiles/${accessProfile.id}`;

    const myHttpOptions = {
      headers: new HttpHeaders({}),
    };

    return this.http.delete(url, myHttpOptions);
  }

  searchAccounts(query: SimpleQueryCondition): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/search/`;

    const payload = {
      query: {
        query: `${query.attribute}:\"${query.value}\"`,
      },
      indices: ['identities'],
    };

    return this.http.post(url, payload, this.httpOptions).pipe(
      catchError(error => {
        if (error.status === 429) {
          console.warn('Rate limited. Retrying in 2 seconds...');
          this.sleep(2000);
          return this.searchAccounts(query);
        } else {
          catchError(this.handleError(`searchAccounts`));
        }
      })
    );
  }

  searchIdentityRequestAudit(requestNumber: String): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/search/`;

    const payload = {
      query: {
        query: `trackingNumber:\"${requestNumber}\"`,
      },
      indices: ['accountactivities'],
      sort: ['modified'],
    };

    return this.http.post(url, payload, this.httpOptions).pipe(
      catchError(error => {
        if (error.status === 429) {
          console.warn('Rate limited. Retrying in 2 seconds...');
          this.sleep(2000);
          return this.searchIdentityRequestAudit(requestNumber);
        } else {
          catchError(this.handleError(`searchAccounts`));
        }
      })
    );
  }

  revokeRole(query: RevokeRole): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/access-requests/`;
    //There is no return from this endpoint not sure what to do?
    return this.http
      .post(url, query, this.httpOptions)
      .pipe(catchError(this.handleError(`revokeRole`)));
  }

  //Used for the reports of roles containing entitlements
  searchEntitlements(input: SimpleQueryCondition): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/search/?count=true&limit=5`;

    let payload = {
      query: {
        query: `name:${input.value}`,
      },
      indices: ['entitlements'],
    };
    if (input.attribute) {
      payload = {
        query: {
          query: `name:${input.value} AND source.id:${input.attribute}`,
        },
        indices: ['entitlements'],
      };
    }

    return this.http
      .post(url, payload, this.httpOptions)
      .pipe(catchError(this.handleError(`searchEntitlements`)));
  }

  getEntitlement(input: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/entitlements/${input}`;

    return this.http
      .get(url, this.httpOptions)
      .pipe(catchError(this.handleError(`getEntitlement`)));
  }

  //Used for the reports of roles containing entitlements
  rolesContainingOneEntitlement(idNumber): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/search/?count=true`;

    const payload = {
      query: {
        query: `@entitlements(id:${idNumber})`,
      },
      indices: ['roles'],
    };

    return this.http
      .post(url, payload, this.httpOptions)
      .pipe(catchError(this.handleError(`searchEntitlements`)));
  }

  searchAccountsPaged(
    query: SimpleQueryCondition,
    page: PageResults
  ): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url =
      `https://${currentUser.tenant}.api.${currentUser.domain}/v3/search/?count=true&limit=` +
      page.limit +
      '&offset=' +
      page.offset;

    let search = null;
    if (query.lastName != null && query.lastName != '') {
      search = 'attributes.lastname:' + query.lastName;
    }
    if (query.firstName != null && query.firstName != '') {
      const search2 = 'attributes.firstname:' + query.firstName;
      if (search == null) {
        search = search2;
      } else {
        search = search + ' AND ' + search2;
      }
    }

    //for the email if the object contains the @ simple it gets treated special.
    if (query.email != null && query.email != '') {
      let search2 = '';
      if (query.email.includes('@')) {
        search2 = `attributes.email:\"` + query.email + `\"`;
      } else {
        search2 = 'attributes.email:' + query.email;
      }

      if (search == null) {
        search = search2;
      } else {
        search = search + ' AND ' + search2;
      }
    }
    if (query.managerName != null && query.managerName != '') {
      const search2 = 'manager.name:' + query.managerName;
      if (search == null) {
        search = search2;
      } else {
        search = search + ' AND ' + search2;
      }
    }

    if (query.value != null && query.value != '') {
      const processed = query.value.split('\\').join('\\\\');
      const search2 = `${query.attribute}:\"${processed}\"`;
      if (search == null) {
        search = search2;
      } else {
        search = search + ' AND ' + search2;
      }
    }
    console.log(search);
    const payload = {
      query: {
        query: search,
      },
      indices: ['identities'],
    };

    return this.http
      .post(url, payload, { observe: 'response' })
      .pipe(catchError(this.handleError(`searchAccounts`)));
  }

  searchActivites(filterString): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/search/?count=true`;

    const payload = {
      query: {
        query: filterString,
      },
      indices: ['accountactivities'],
      sort: ['-modified'],
    };

    return this.http
      .post(url, payload, { observe: 'response' })
      .pipe(catchError(this.handleError(`searchActivities`)));
  }

  searchAttributeSync(filterString): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/search/?count=true`;

    const payload = {
      query: {
        query: filterString,
      },
      sort: ['-modified'],
    };

    return this.http
      .post(url, payload, { observe: 'response' })
      .pipe(catchError(this.handleError(`searchActivities`)));
  }

  /**
   * This is used on the identity page that pulls back all attributes that can be used
   * for searching and finding a user
   * @returns
   */
  searchableAttributes(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/identity-attributes?count=true`;

    return this.http
      .get(url, { observe: 'response' })
      .pipe(catchError(this.handleError(`searchableAttributes`)));
  }
  /*
   * Gets accounts correlated or not
   */
  searchApplicationAccounts(
    query: SimpleQueryCondition,
    page: PageResults,
    searchType: String,
    searchAttribute: String
  ): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url =
      `https://${currentUser.tenant}.api.${currentUser.domain}/v3/accounts/?count=true&limit=` +
      page.limit +
      '&offset=' +
      page.offset;

    let filter = '';
    let preFilter = false;
    if (query.value) {
      filter =
        '&filters=' +
        searchAttribute +
        ' ' +
        searchType +
        '  "' +
        query.value +
        '"';
      preFilter = true;
    }
    if (query.attribute) {
      if (preFilter == false) {
        filter = '&filters=sourceId eq "' + query.attribute + '"';
      } else {
        filter = filter + ' and sourceId eq "' + query.attribute + '"';
      }
    }

    return this.http.get(url + filter, { observe: 'response' }).pipe(
      catchError(error => {
        if (error.status === 429) {
          this.logError('Rate limited. Retrying in 2 seconds...');
          this.sleep(2000);
          return this.searchApplicationAccounts(
            query,
            page,
            searchType,
            searchAttribute
          );
        } else {
          this.logError(`timeout getting record counts returning last 200`);
          page.limit = 200;
          this.handleError(`searchApplicationAccounts`);
        }
      })
    );
  }

  countApplicationAccounts(
    appID: String,
    unCorrelatedOnly: boolean
  ): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/accounts?count=true&limit=1&filters=sourceId eq "${appID}"`;

    if (unCorrelatedOnly) {
      url = url + `and uncorrelated eq true`;
    }
    return this.http.get(url, { observe: 'response' }).pipe(
      catchError(error => {
        if (error.status === 429) {
          //this.logError('Rate limited. Retrying in 2 seconds...');
          this.sleep(2000);
          return this.countApplicationAccounts(appID, unCorrelatedOnly);
        } else {
          //this.logError(`timeout getting record counts returning last 200`);
          this.handleError(`countApplicationAccounts`);
        }
      })
    );
  }

  countEntitlements(appID: String): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/entitlements?count=true&limit=1&filters=source.id eq "${appID}"`;

    return this.http.get(url, { observe: 'response' }).pipe(
      catchError(error => {
        if (error.status === 429) {
          //this.logError('Rate limited. Retrying in 2 seconds...');
          this.sleep(2000);
          return this.countEntitlements(appID);
        } else {
          this.handleError(`countEntitlments`);
        }
      })
    );
  }

  updateSourceOwner(source: Source): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/sources/${source.id}`;

    const myHttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json-patch+json',
      }),
    };

    const payload = [
      {
        op: 'replace',
        path: '/owner',
        value: {
          type: 'IDENTITY',
          id: null,
          name: null,
        },
      },
    ];

    payload[0].value.id = source.newOwner.accountId;
    payload[0].value.name = source.newOwner.displayName;

    return this.http.patch(url, payload, myHttpOptions);
  }

  getAccountAggregationStatus(taskId: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/account-aggregations/${taskId}/status`;

    return this.http
      .get(url)
      .pipe(catchError(this.handleError(`getAccountAggregationStatus`)));
  }

  getConnectorRules(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/connector-rules`;

    return this.http.get(url, this.httpOptions);
  }

  getConnectorRuleById(ruleId: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/connector-rules/${ruleId}`;

    return this.http.get(url, this.httpOptions);
  }

  importConnectorRule(rule: Rule): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/connector-rules`;

    const myHttpOptions = {
      headers: new HttpHeaders({}),
    };

    const payload = {
      name: `${rule.name}`,
      type: `${rule.type}`,
      sourceCode: {
        version: '1.0',
        script: `${rule.script}`,
      },
      description: `${rule.description}`,
      attributes: {},
    };

    if (rule.attributes) {
      payload.attributes = rule.attributes;
    }
    return this.http.post(url, payload, myHttpOptions);
  }

  updateConnectorRule(rule: Rule): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/connector-rules/${rule.id}`;

    const myHttpOptions = {
      headers: new HttpHeaders({}),
    };

    const payload = {
      name: `${rule.name}`,
      type: `${rule.type}`,
      id: `${rule.id}`,
      sourceCode: {
        version: '1.0',
        script: `${rule.script}`,
      },
      description: `${rule.description}`,
      attributes: {},
    };

    if (rule.attributes) {
      payload.attributes = rule.attributes;
    }

    return this.http.put(url, payload, myHttpOptions);
  }

  deleteConnectorRule(rule: Rule): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/connector-rules/${rule.id}`;

    const myHttpOptions = {
      headers: new HttpHeaders({}),
    };

    return this.http.delete(url, myHttpOptions);
  }

  getOrgConfig(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/org-config`;

    return this.http.get(url, this.httpOptions);
  }

  getHostingData(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/tenant-data/hosting-data`;

    return this.http.get(url, this.httpOptions);
  }

  getIdentityCount(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/search/identities?limit=1&count=true`;

    const payload = {
      query: {
        query: `*`,
      },
    };

    return this.http.post(url, payload, { observe: 'response' });
  }

  getAccountCount(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/accounts?limit=1&count=true`;

    return this.http.get(url, { observe: 'response' });
  }

  getIdentityProfileCount(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/identity-profiles?limit=1&count=true`;

    return this.http.get(url, { observe: 'response' });
  }

  getSourceCount(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/sources?limit=1&count=true`;

    return this.http.get(url, { observe: 'response' });
  }

  getTotalAccessProfilesCount(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/access-profiles?limit=1&count=true`;

    return this.http.get(url, { observe: 'response' }).pipe(
      map(response => response.headers.get('X-Total-Count')),
      map(totalCount => parseInt(totalCount, 10)),
      catchError(error => throwError(error))
    );
  }

  getEntitlementCount(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/entitlements?limit=1&count=true`;

    return this.http.get(url, { observe: 'response' });
  }

  getTotalCampaignCount(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/campaigns?limit=1&count=true`;

    return this.http.get(url, { observe: 'response' });
  }

  getActiveCampaignCount(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/campaigns?limit=1&count=true&filters=status eq "ACTIVE"`;

    return this.http.get(url, { observe: 'response' });
  }

  getCompletedCampaignCount(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/campaigns?limit=1&count=true&filters=status eq "COMPLETED"`;

    return this.http.get(url, { observe: 'response' });
  }

  getPasswordChangeCount(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/search?limit=1&count=true`;

    const payload = {
      query: {
        query:
          'technicalName:PASSWORD_ACTION_CHANGE_PASSED AND created:[now-7d/d TO now]',
      },
      indices: ['events'],
    };

    return this.http.post(url, payload, { observe: 'response' });
  }

  getProvisioningActivityCount(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/search?limit=1&count=true`;

    const payload = {
      query: {
        query: `technicalName:(\"ACCOUNT_CREATE_PASSED\" OR \"ACCOUNT_ENABLE_PASSED\" OR \"ACCOUNT_DISABLE_PASSED\" OR \"ENTITLEMENT_ADD_PASSED\" OR \"APP_REQUEST_PASSED\" OR \"PASSWORD_ACTION_CHANGE_PASSED\") AND created:[now-7d/d TO now]`,
      },
      indices: ['events'],
    };

    return this.http.post(url, payload, { observe: 'response' });
  }

  getValidTimeZones(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/org-config/valid-time-zones`;

    return this.http.get(url, this.httpOptions);
  }

  updateOrgTimeConfig(timeZoneValue: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/org-config`;

    const myHttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json-patch+json',
      }),
    };

    const payload = [
      {
        op: 'replace',
        path: '/timeZone',
        value: `${timeZoneValue}`,
      },
    ];

    return this.http.patch(url, payload, myHttpOptions);
  }

  getAllPAT(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/personal-access-tokens`;

    return this.http.get(url, this.httpOptions);
  }

  getUserPAT(id: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/personal-access-tokens?owner-id=${id}`;

    return this.http.get(url, this.httpOptions);
  }

  deletePAT(pat: PAT): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/personal-access-tokens/${pat.id}`;

    const myHttpOptions = {
      headers: new HttpHeaders({}),
    };

    return this.http.delete(url, myHttpOptions);
  }
  /**
   * This is used on the Identity page it only provides one set of
   * data that lets you know about any internal access the user has in IdentityNow
   * such as ORG_ADMIN
   * @param alias
   * @returns
   */
  getUserByAlias(alias: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/identities?alias=${alias}`;

    return this.http.get(url, this.httpOptions).pipe(
      catchError(error => {
        if (error.status === 429) {
          console.warn('Rate limited. Retrying in 2 seconds...');
          this.sleep(2000);
          return this.getUserByAlias(alias);
        } else {
          catchError(this.handleError(`getUserByAlias`));
        }
      })
    );
  }

  exportCloudRules(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/sp-config/export`;

    const payload = {
      description: 'Export Rules - Call by IDN Admin Console',
      includeTypes: ['RULE'],
    };

    return this.http
      .post(url, payload, this.httpOptions)
      .pipe(catchError(this.handleError(`exportCloudRules`)));
  }

  checkSPConfigJobStatus(jobId: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/sp-config/export/${jobId}`;

    return this.http
      .get(url, this.httpOptions)
      .pipe(catchError(this.handleError(`checkSPConfigJobStatus`)));
  }

  downloadSPConfigExport(jobId: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/sp-config/export/${jobId}/download`;

    return this.http
      .get(url, this.httpOptions)
      .pipe(catchError(this.handleError(`downloadSPConfigExport`)));
  }

  getAllIdentityProfiles(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/identity-profiles?sorters=priority`;

    return this.http
      .get(url, this.httpOptions)
      .pipe(catchError(this.handleError(`getAllIdentityProfiles`)));
  }

  refreshIdentityProfile(profileId: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/identity-profiles/${profileId}/refresh-identities`;

    return this.http.post(url, this.httpOptions);
  }

  updateProfilePriority(profile: IdentityProfile): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/identity-profiles/${profile.id}`;

    const myHttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json-patch+json',
      }),
    };

    const payload = [
      {
        op: 'replace',
        path: '/priority',
        value: `${profile.newPriority}`,
      },
    ];

    return this.http.patch(url, payload, myHttpOptions);
  }

  getAllTransforms(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/transforms`;

    return this.http
      .get(url, this.httpOptions)
      .pipe(catchError(this.handleError(`getAllTransforms`)));
  }

  getTransformById(transformId: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/transforms/${transformId}`;

    return this.http.get(url, this.httpOptions);
  }

  updateTransform(transform: Transform): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/transforms/${transform.id}`;

    const payload = transform;

    return this.http.put(url, payload, this.httpOptions);
  }

  deleteTransform(transformId: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/transforms/${transformId}`;

    return this.http.delete(url, this.httpOptions);
  }

  createTransform(transform: Transform): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/transforms/`;

    const payload = transform;

    return this.http.post(url, payload, this.httpOptions);
  }

  getSourceCreateProfile(sourceId: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/sources/${sourceId}/provisioning-policies/CREATE`;

    return this.http.get(url, this.httpOptions);
  }

  createSourceCreateProfile(
    sourceId: string,
    attribute: string
  ): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/sources/${sourceId}/provisioning-policies`;

    const payload = {
      name: 'Account',
      description: null,
      usageType: 'CREATE',
      fields: [
        {
          name: attribute,
          transform: null,
          attributes: {},
          isRequired: false,
          type: 'string',
          isMultiValued: false,
        },
      ],
    };

    return this.http.post(url, payload);
  }

  createSourceCreateProfileAttribute(
    sourceId: string,
    attribute: string
  ): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/sources/${sourceId}/provisioning-policies/CREATE`;

    const myHttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json-patch+json',
      }),
    };

    const payload = [
      {
        op: 'add',
        path: '/fields/-',
        value: {
          name: attribute,
          transform: null,
          attributes: {},
          isRequired: false,
          type: 'string',
          isMultiValued: false,
        },
      },
    ];

    return this.http.patch(url, payload, myHttpOptions);
  }

  deleteSourceCreateProfileAttribute(
    sourceId: string,
    attributeJSONIndex: number
  ): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/sources/${sourceId}/provisioning-policies/CREATE`;

    const myHttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json-patch+json',
      }),
    };

    const payload = [
      {
        op: 'remove',
        path: `/fields/${attributeJSONIndex}`,
      },
    ];

    return this.http.patch(url, payload, myHttpOptions);
  }

  getAccessRequestStatus(filters): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let filteredURL = '';
    if (filters != null) {
      filteredURL = filteredURL + filters;
    }
    const url =
      `https://${currentUser.tenant}.api.${currentUser.domain}/v3/access-request-status?sorters=-created` +
      filteredURL;

    return this.http.get(url, this.httpOptions);
  }

  /**
   * Not sure where the unpaged version might be called so to make
   * sure I dont break anything cloned the method
   * @param filters
   * @param page
   * @returns
   */
  getAccessRequestStatusPaged(
    filters,
    reqID,
    filterGt,
    filterLt,
    page: PageResults,
    count
  ): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let filteredURL = '';
    if (filters != null) {
      filteredURL = filteredURL + '&requested-for=' + filters;
    }
    let filterString = '';
    if (reqID != null) {
      filterString = `&filters=accessRequestId eq "${reqID}"`;
    }
    if (filterGt != null && filterLt != null) {
      filterString = `&filters=created gt ${filterGt} and created lt ${filterLt}`;
    }

    const url =
      `https://${currentUser.tenant}.api.${currentUser.domain}/v3/access-request-status?sorters=-created` +
      filteredURL +
      filterString +
      '&limit=' +
      page.limit +
      '&offset=' +
      page.offset +
      '&count=' +
      count;

    return this.http.get(url, { observe: 'response' }).pipe(
      catchError(error => {
        if (error.status === 429) {
          this.logError('Rate limited. Retrying in 2 seconds...');
          this.sleep(2000);
          return this.getAccessRequestStatusPaged(
            filters,
            reqID,
            filterGt,
            filterLt,
            page,
            false
          );
        } else {
          page.limit = 200;
          return this.getAccessRequestStatusPaged(
            filters,
            reqID,
            filterGt,
            filterLt,
            page,
            false
          );
        }
      })
    );
  }

  getEntilementsPaged(filters, page: PageResults): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const filteredURL = '';
    console.log(filters);
    const url =
      `https://${currentUser.tenant}.api.${currentUser.domain}/beta/entitlements?` +
      filteredURL +
      '&limit=' +
      page.limit +
      '&offset=' +
      page.offset +
      '&count=true';

    return this.http.get(url, { observe: 'response' }).pipe(
      catchError(error => {
        if (error.status === 429) {
          this.logError('Rate limited. Retrying in 2 seconds...');
          this.sleep(2000);
          return this.getEntilementsPaged(filters, page);
        }
      })
    );
  }

  getAccessRequestApprovalsPending(page: PageResults): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url =
      `https://${currentUser.tenant}.api.${currentUser.domain}/v3/access-request-approvals/pending?sorters=-created` +
      '&limit=' +
      page.limit +
      '&offset=' +
      page.offset +
      '&count=true';

    return this.http.get(url, { observe: 'response' });
  }

  getAccessRequestApprovalsPendingUser(ownerid: String): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/access-request-approvals/pending?sorters=-created&owner-id=${ownerid}`;

    return this.http.get(url);
  }

  forwardAccessRequestApproval(
    approvalToForwardId: string,
    newOwnerId: string,
    comment: string
  ): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/access-request-approvals/${approvalToForwardId}/forward`;

    const payload = {
      newOwnerId: newOwnerId,
      comment: comment,
    };

    return this.http.post(url, payload);
  }

  addTag(type: string, id: string, name: string, tag: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;

    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/tagged-objects`;

    const payload = {
      objectRef: {
        type: `${type}`,
        id: `${id}`,
        name: `${name}`,
      },
      tags: [`${tag}`],
    };
    const myHttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    return this.http.post(url, payload, myHttpOptions);
  }

  getSourceByName(name: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const params = '?filters=name eq "' + name + '"' + '&count=true';
    const url =
      `https://${currentUser.tenant}.api.${currentUser.domain}/v3/sources` +
      params;
    console.log(url);
    return this.http.get(url, this.httpOptions);
  }

  getRoleByName(name: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const params = '?filters=name eq "' + name + '"' + '&count=true';
    const url =
      `https://${currentUser.tenant}.api.${currentUser.domain}/v3/roles` +
      params;
    console.log(url);
    return this.http.get(url, this.httpOptions);
  }

  deleteTag(type: string, id: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/tagged-objects/${type}/${id}`;
    const myHttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    return this.http.delete(url, myHttpOptions);
  }

  getTags(type: string, value: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/tagged-objects/${type}/${value}`;

    return this.http.get(url, this.httpOptions).pipe(
      catchError(error => {
        if (error.status === 429) {
          this.sleep(2000);
          return this.getTags(type, value);
        } else {
          catchError(this.handleError(`getTags`));
        }
      })
    );
  }

  getSchedules(value: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v2024/sources/${value}/schedules`;

    const myHttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'X-SailPoint-Experimental': 'true',
      }),
    };
    return this.http.get(url, myHttpOptions).pipe(
      catchError(error => {
        if (error.status === 429) {
          this.sleep(2000);
          return this.getSchedules(value);
        } else {
          catchError(this.handleError(`getSchedules`));
        }
      })
    );
  }

  getRoleDetails(value: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/roles/${value}`;

    return this.http.get(url, this.httpOptions).pipe(
      catchError(error => {
        if (error.status === 429) {
          this.sleep(2000);
          return this.getRoleDetails(value);
        } else {
          catchError(this.handleError(`getRoleDetails`));
        }
      })
    );
  }

  getWorkItemsStatus(filters): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let filteredURL = '';
    if (filters != null) {
      filteredURL = filteredURL + filters;
    }

    const url =
      `https://${currentUser.tenant}.api.${currentUser.domain}/v3/work-items?sorters=-created` +
      filteredURL;

    return this.http.get(url, this.httpOptions);
  }

  getWorkItemsPending(page: PageResults): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url =
      `https://${currentUser.tenant}.api.${currentUser.domain}/v3/work-items?sorters=-created` +
      '&limit=' +
      page.limit +
      '&offset=' +
      page.offset +
      '&count=true';

    return this.http.get(url, { observe: 'response' });
  }

  getWorkItemsCompleted(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/work-items/completed?sorters=-created`;

    return this.http.get(url, this.httpOptions);
  }

  getWorkItemsSummary(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/work-items/summary`;

    return this.http.get(url, this.httpOptions);
  }

  forwardPendingWorkItem(
    workItemId: string,
    newOwnerId: string,
    comment: string
  ): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/work-items/${workItemId}/forward`;

    const payload = {
      targetOwnerId: newOwnerId,
      comment: comment,
      sendNotifications: true,
    };

    return this.http.post(url, payload);
  }

  changeEntitlementOwner(
    entitlementId: string,
    op: string,
    newOwnerId: string
  ): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/entitlements/${entitlementId}`;

    let payload = null;

    if (op === 'remove') {
      payload = {
        op: `${op}`,
        path: '/owner',
      };
    } else {
      payload = {
        op: `${op}`,
        path: '/owner',
        value: {
          type: 'IDENTITY',
          id: newOwnerId,
        },
      };
    }

    //Not sure if this is because its bata but Entitlements must be list for one
    const list = new Array();
    list.push(payload);

    const myHttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json-patch+json',
      }),
    };

    return this.http.patch(url, list, myHttpOptions);
  }

  changeEntitlementFlags(
    entitlementId: string,
    op: string,
    path: string,
    value: boolean
  ): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/entitlements/${entitlementId}`;

    const payload = {
      op: `${op}`,
      path: `${path}`,
      value: `${value}`,
    };

    //Not sure if this is because its bata but Entitlements must be list for one
    const list = new Array();
    list.push(payload);

    const myHttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json-patch+json',
      }),
    };

    return this.http.patch(url, list, myHttpOptions);
  }

  getAccessRequestApprovalsSummary(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/access-request-approvals/approval-summary`;

    return this.http.get(url, this.httpOptions);
  }

  getIdentityProfile(profileId: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/identity-profiles/${profileId}`;

    return this.http.get(url, this.httpOptions);
  }

  getIdentityProfileLCS(profileId: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/identity-profiles/${profileId}/lifecycle-states`;

    return this.http.get(url, this.httpOptions);
  }

  deleteIdentityProfileLCS(profileId: string, lcsId: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/identity-profiles/${profileId}/lifecycle-states/${lcsId}`;

    const myHttpOptions = {
      headers: new HttpHeaders({}),
    };

    return this.http.delete(url, myHttpOptions);
  }

  getAllEntitlementsPaged(
    filters: string,
    appName: string,
    page: PageResults
  ): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let params = '?count=true';
    if (filters != null || appName != null) {
      let fil = null;
      if (filters != null) {
        fil = 'name sw "' + filters + '"';
      }
      if (appName != null) {
        if (fil != null) {
          fil = fil + ' and ';
        } else {
          fil = '';
        }
        fil = fil + 'source.id eq "' + appName + '"';
      }
      params = '?filters=' + fil + '&count=true';
    }
    const url =
      `https://${currentUser.tenant}.api.${currentUser.domain}/beta/entitlements` +
      params +
      '&limit=' +
      page.limit +
      '&offset=' +
      page.offset +
      '&count=true';

    return this.http.get(url, { observe: 'response' });
  }

  getIDNAdmins(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/search`;

    const payload = {
      queryType: 'SAILPOINT',
      indices: ['identities'],
      query: {
        query: '@access(source.name.exact:IdentityNow)',
      },
      sort: ['displayName'],
      queryResultFilter: {
        includes: [
          'id',
          'name',
          'displayName',
          'protected',
          'status',
          'created',
          'modified',
        ],
      },
    };

    return this.http.post(url, payload, { observe: 'response' });
  }

  getAllReassignments(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/beta/reassignment-configurations`;

    return this.http
      .get(url, this.httpOptions)
      .pipe(catchError(this.handleError(`getAllTransforms`)));
  }
  /**
   * Method to post IdentityPreview object to get Return Vlaue
   * @param profileId
   * @returns
   */
  getTransformResults(profileId: IdentityPreview): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/identity-profiles/identity-preview`;

    return this.http.post(url, profileId, this.httpOptions);
  }
  /*
  Simple query to just the get the public parts of the identity.  
  */
  getPersonID(input: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/public-identities?filters=alias eq "${input}"&limit=1`;

    return this.http
      .get(url, this.httpOptions)
      .pipe(catchError(this.handleError(`getPersonId`)));
  }

  getGeneralObject(page: PageResults, objectPath: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url =
      `https://${currentUser.tenant}.api.${currentUser.domain}/${objectPath}?sorters=-created` +
      '&limit=' +
      page.limit +
      '&offset=' +
      page.offset +
      '&count=true';

    return this.http.get(url, { observe: 'response' });
  }

  getWorkflows(page: PageResults): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url =
      `https://${currentUser.tenant}.api.${currentUser.domain}/v3/workflows?sorters=name` +
      '&limit=' +
      page.limit +
      '&offset=' +
      page.offset +
      '&count=true';

    return this.http.get(url, { observe: 'response' });
  }

  getWorkflowExecutions(
    page: PageResults,
    workflow: String,
    failedOnly: boolean
  ): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    let url =
      `https://${currentUser.tenant}.api.${currentUser.domain}/v3/workflows/${workflow}/executions?` +
      'limit=' +
      page.limit +
      '&offset=' +
      page.offset +
      '&count=true';
    if (failedOnly == true) {
      url = url + '&filters=status eq "Failed"';
    }

    return this.http.get(url, { observe: 'response' });
  }

  getWorkflowExecutionsDetails(workflow: String): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/workflow-executions/${workflow}/history`;

    return this.http.get(url, { observe: 'response' });
  }

  saveGeneralObject(
    rawFormData,
    primaryKeySource,
    objectPath: string
  ): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/${objectPath}/${primaryKeySource}`;

    const myHttpOptions = {
      headers: new HttpHeaders({}),
      'Content-Type': 'application/json',
    };
    // const data = JSON.parse(rawFormData);
    return this.http.put(url, rawFormData, myHttpOptions);
  }

  private logError(error: string) {
    this.messageService.addError(`${error}`);
  }

  /**
   * Handle Http operation that failed.
   * const the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(
    operation = 'operation',
    result?: T,
    logErr: boolean = true
  ) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      if (logErr) {
        this.logError(`${operation} failed: ${error.message}`);
      }
      // const the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  failuresBySource(idNumber, limit, syncQuery): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/search/?count=true&limit=${limit}&offset=0`;

    let payload = {
      query: {
        query: `sources= "${idNumber}" AND _exists_:errors`,
      },
      indices: ['accountactivities'],
      sort: ['-modified'],
    };
    if (syncQuery == true) {
      payload = {
        query: {
          query: `attributes.interface.exact:/Attribute Syn.+/ AND (attributes.sourceName:\"${idNumber}\")`,
        },
        indices: ['events'],
        sort: ['-created'],
      };
    }
    return this.http
      .post(url, payload, this.httpOptions)
      .pipe(catchError(this.handleError(`searchEntitlements`)));
  }




  eventCount(payload): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/search/?count=true&limit=1&offset=0`;

    //return this.http.get(url + filter, { observe: 'response' }).pipe(
    return this.http.post(url, payload, { observe: 'response' }).pipe(
      catchError(error => {
        if (error.status === 429) {
          console.warn('Rate limited. Retrying in 2 seconds...');
          this.sleep(3000);
          return this.eventCount(payload);
        } else {
          catchError(this.handleError(`eventCount`));
        }
      })
    );
  }

 

  sinkByPerson(idNumber): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/search/?count=true&offset=0`;

    const payload = {
      query: {
        query: `attributes.interface.exact:/Attribute Syn.+/ AND (target.name:\"${idNumber}\")`,
      },
      indices: ['events'],
      sort: ['-created'],
    };
    /*
return this.http.post(url, payload, { observe: 'response' }).pipe(
      catchError(error => {
        if (error.status === 429) {
          console.warn('Rate limited. Retrying in 2 seconds...');
          this.sleep(2000);
          return this.provisioningCountBySource(idNumber, limit);
        } else {
          catchError(this.handleError(`provisioningCountBySource`));
        }
      })
    );
    */
    return this.http.post(url, payload, { observe: 'response' }).pipe(
      catchError(error => {
        if (error.status === 429) {
          console.warn('Rate limited. Retrying in 1 seconds...');
          this.sleep(1000);
          return this.sinkByPerson(idNumber);
        } else {
          catchError(this.handleError(`Cant pull Person Sync data`));
        }
      })
    );
  }

  /*
  private hideError<T>(result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
      result = error.message;
      if (error.message != null) {
        if (error.message.errorMessage != null) {
          result = error.message.errorMessage;
        }
      }
      if (error.status == 429) {
        console.log('toMany requests');
      }

      // const the app keep running by returning an empty result.
      return of(result as T);
    };
  }
    */
  /**
   * Method to pause the request when we get 429 errors
   * @param ms
   * @returns
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
