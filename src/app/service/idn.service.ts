import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpUrlEncodingCodec,
} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
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

  getAllSources(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/sources`;

    return this.http
      .get(url, this.httpOptions)
      .pipe(catchError(this.handleError(`getAllSources`)));
  }

  getSource(sourceId: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/sources/${sourceId}`;

    return this.http
      .get(url, this.httpOptions)
      .pipe(catchError(this.handleError(`getAggregationSources`)));
  }

  getSourceCCApi(cloudExternalID: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/cc/api/source/get/${cloudExternalID}`;
    return this.http.get(url);
    /*
    return this.http.get(url).pipe(
      catchError(this.handleError(`getAggregationSchedules`))
    );
    */
  }

  resetSource(cloudExternalID: string, skipType: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/cc/api/source/reset/${cloudExternalID}`;

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

  refreshAllRoles(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/cc/api/role/refresh`;

    return this.http
      .post(url, null, { responseType: 'text' })
      .pipe(catchError(this.handleError(`refreshAllRoles`)));
  }

  getAllRoles(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/roles`;

    return this.http
      .get(url, this.httpOptions)
      .pipe(catchError(this.handleError(`getAllRoles`)));
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

  getAllAccessProfiles(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/access-profiles`;

    return this.http
      .get(url, this.httpOptions)
      .pipe(catchError(this.handleError(`getAllAccessProfiles`)));
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

  getAggregationSchedules(cloudExternalID: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/cc/api/source/getAggregationSchedules/${cloudExternalID}`;
    return this.http.get(url);
    /*
    return this.http.get(url).pipe(
      catchError(this.handleError(`getAggregationSchedules`))
    );
    */
  }

  getEntitlementAggregationSchedules(cloudExternalID: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/cc/api/source/getEntitlementAggregationSchedules/${cloudExternalID}`;
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
    encodedCronExp = encodedCronExp.replace('?', '%3F');
    const url = `https://${currentUser.tenant}.
                  api.${currentUser.domain}/cc/api/source/scheduleEntitlementAggregation/
                  ${source.cloudExternalID}?enable=${enable}&cronExp=${encodedCronExp}`;

    const myHttpOptions = {
      headers: new HttpHeaders({}),
    };
    return this.http.post(url, null, myHttpOptions);
  }

  searchAccounts(query: SimpleQueryCondition): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/search/`;

    const payload = {
      query: {
        query: `${query.attribute}:\"${query.value}\"`,
      },
    };

    return this.http
      .post(url, payload, this.httpOptions)
      .pipe(catchError(this.handleError(`searchAccounts`)));
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

  aggregateSourceOwner(
    cloudExternalID: string,
    formData: FormData
  ): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/cc/api/source/loadAccounts/${cloudExternalID}`;

    const myHttpOptions = {
      headers: new HttpHeaders({}),
    };

    return this.http.post(url, formData, myHttpOptions);
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

  getAccessProfileCount(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/access-profiles?limit=1&count=true`;

    return this.http.get(url, { observe: 'response' });
  }

  getRoleCount(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/roles?limit=1&count=true`;

    return this.http.get(url, { observe: 'response' });
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

  deletePAT(pat: PAT): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/personal-access-tokens/${pat.id}`;

    const myHttpOptions = {
      headers: new HttpHeaders({}),
    };

    return this.http.delete(url, myHttpOptions);
  }

  getUserByAlias(alias: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/cc/api/user/get?alias=${alias}`;

    return this.http.get(url, this.httpOptions);
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

  getIdentityProfilesv1(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/cc/api/profile/list?sorters=priority`;

    return this.http
      .get(url, this.httpOptions)
      .pipe(catchError(this.handleError(`getAllIdentityProfilesv1`)));
  }

  updateProfilePriorityv1(profile: IdentityProfile): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/cc/api/profile/update/${profile.id}`;

    const formdata = new FormData();
    formdata.append('priority', `${profile.newPriority}`);

    return this.http.post(url, formdata);
  }

  refreshIdentityProfilev1(profileId: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/cc/api/profile/refresh/${profileId}`;

    const myHttpOptions = {
      headers: new HttpHeaders({}),
    };

    return this.http.post(url, null, myHttpOptions);
  }

  getAllIdentityAttributes(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/cc/api/identityAttribute/list`;

    return this.http
      .get(url, this.httpOptions)
      .pipe(catchError(this.handleError(`getAllIdentityAttributes`)));
  }

  updateAttributeIndex(attribute: IdentityAttribute): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/cc/api/identityAttribute/update?name=${attribute.name}`;

    const payload = {
      displayName: attribute.displayName,
      name: attribute.name,
      searchable: attribute.searchable,
      sources: attribute.sources,
      type: attribute.type,
    };

    return this.http.post(url, payload);
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

  getAccessRequestStatus(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/access-request-status?sorters=-created`;

    return this.http.get(url, this.httpOptions);
  }

  getAccessRequestApprovalsPending(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/access-request-approvals/pending?sorters=-created`;

    return this.http.get(url, this.httpOptions);
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

  getWorkItemsPending(): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/v3/work-items?sorters=-created`;

    return this.http.get(url, this.httpOptions);
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

  refreshSingleIdentity(identityId: string): Observable<any> {
    const currentUser = this.authenticationService.currentUserValue;
    const url = `https://${currentUser.tenant}.api.${currentUser.domain}/cc/api/system/refreshIdentities`;

    const payload = {
      filter: `name == \"${identityId}\"`,
      refreshArgs: {
        correlateEntitlements: 'true',
        promoteAttributes: 'true',
        refreshManagerStatus: 'true',
        synchronizeAttributes: 'true',
        pruneIdentities: 'true',
        provision: 'true',
      },
    };

    return this.http.post(url, payload, this.httpOptions);
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
}
