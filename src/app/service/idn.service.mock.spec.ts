/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpHeaders, HttpUrlEncodingCodec } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Source } from '../model/source';
import { Rule } from '../model/rule';
import { SimpleQueryCondition } from '../model/simple-query-condition';
import { AggTaskPollingStatus } from '../model/agg-task-polling-status';
import { Role } from '../model/role';
import { AccessProfile } from '../model/accessprofile';
import { PAT } from '../model/pat';
import { IdentityProfile } from '../model/identity-profile';
import { IdentityAttribute } from '../model/identity-attribute';
import { Transform } from '../model/transform';

export class MockIDNService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  codec = new HttpUrlEncodingCodec();

  aggTaskPollingStatusMock: AggTaskPollingStatus = {
    taskId: '',
    completed: false,
  };

  //Keep track of source aggregation task ID and its polling (calling IDN API to fetch Task completed status) status.
  aggTaskPollingStatusMap = {};

  constructor() {}

  startAggTaskPolling(_cloudExternalID: string, _taskId: string) {}

  getAggTaskPolling(_cloudExternalID: string): AggTaskPollingStatus {
    return this.aggTaskPollingStatusMock;
  }

  finishAggTaskPolling(_cloudExternalID: string): AggTaskPollingStatus {
    return this.aggTaskPollingStatusMock;
  }

  searchMultipleAccounts(): Observable<any> {
    return of();
  }
  searchIdentities(_identityId: string): Observable<any> {
    return of();
  }

  getAllSources(): Observable<any> {
    return of();
  }

  getSource(_sourceId: string): Observable<any> {
    return of();
  }

  getSourceCCApi(_cloudExternalID: string): Observable<any> {
    return of();
  }

  resetSource(_cloudExternalID: string, _skipType: string): Observable<any> {
    return of();
  }

  refreshAllRoles(): Observable<any> {
    return of();
  }

  getAllRoles(): Observable<any> {
    return of();
  }

  getRoleIdentityCount(_role: Role): Observable<any> {
    return of();
  }

  updateRoleOwner(_role: Role): Observable<any> {
    return of();
  }

  updateRole(_role: Role, _path: string, _enable: boolean): Observable<any> {
    return of();
  }

  duplicateRole(_role: Role, _newRoleName: string): Observable<any> {
    return of();
  }
  deleteRole(_role: Role): Observable<any> {
    return of();
  }

  getAllAccessProfiles(): Observable<any> {
    return of();
  }

  updateAccessProfileOwner(_accessProfile: AccessProfile): Observable<any> {
    return of();
  }

  updateAccessProfile(
    _accessProfile: AccessProfile,
    _path: string,
    _enable: boolean
  ): Observable<any> {
    return of();
  }
  deleteAccessProfile(_accessProfile: AccessProfile): Observable<any> {
    return of();
  }
  getAggregationSchedules(_cloudExternalID: string): Observable<any> {
    return of();
  }

  getEntitlementAggregationSchedules(
    _cloudExternalID: string
  ): Observable<any> {
    return of();
  }

  updateAggregationSchedules(
    _source: Source,
    _enable: boolean
  ): Observable<any> {
    return of();
  }

  updateEntAggregationSchedules(
    _source: Source,
    _enable: boolean
  ): Observable<any> {
    return of();
  }

  searchAccounts(_query: SimpleQueryCondition): Observable<any> {
    return of();
  }
  updateSourceOwner(_source: Source): Observable<any> {
    return of();
  }

  aggregateSourceOwner(
    _cloudExternalID: string,
    _formData: FormData
  ): Observable<any> {
    return of();
  }
  getAccountAggregationStatus(_taskId: string): Observable<any> {
    return of();
  }

  getConnectorRules(): Observable<any> {
    return of();
  }

  importConnectorRule(_rule: Rule): Observable<any> {
    return of();
  }

  updateConnectorRule(_rule: Rule): Observable<any> {
    return of();
  }

  deleteConnectorRule(_rule: Rule): Observable<any> {
    return of();
  }

  getOrgConfig(): Observable<any> {
    return of();
  }
  getHostingData(): Observable<any> {
    return of();
  }

  getIdentityCount(): Observable<any> {
    return of();
  }
  getAccountCount(): Observable<any> {
    return of();
  }

  getIdentityProfileCount(): Observable<any> {
    return of();
  }

  getSourceCount(): Observable<any> {
    return of();
  }

  getAccessProfileCount(): Observable<any> {
    return of();
  }

  getTotalRolesCount(): Observable<any> {
    return of();
  }

  getEntitlementCount(): Observable<any> {
    return of();
  }

  getTotalCampaignCount(): Observable<any> {
    return of();
  }

  getActiveCampaignCount(): Observable<any> {
    return of();
  }

  getCompletedCampaignCount(): Observable<any> {
    return of();
  }

  getPasswordChangeCount(): Observable<any> {
    return of();
  }

  getProvisioningActivityCount(): Observable<any> {
    return of();
  }

  getValidTimeZones(): Observable<any> {
    return of();
  }

  updateOrgTimeConfig(_timeZoneValue: string): Observable<any> {
    return of();
  }
  getAllPAT(): Observable<any> {
    return of();
  }

  deletePAT(_pat: PAT): Observable<any> {
    return of();
  }

  getUserByAlias(_alias: string): Observable<any> {
    return of();
  }

  exportCloudRules(): Observable<any> {
    return of();
  }

  checkSPConfigJobStatus(_jobId: string): Observable<any> {
    return of();
  }
  downloadSPConfigExport(_jobId: string): Observable<any> {
    return of();
  }
  getAllIdentityProfiles(): Observable<any> {
    return of();
  }
  updateProfilePriority(_profile: IdentityProfile): Observable<any> {
    return of();
  }

  getIdentityProfilesv1(): Observable<any> {
    return of();
  }

  updateProfilePriorityv1(_profile: IdentityProfile): Observable<any> {
    return of();
  }
  refreshIdentityProfilev1(_profileId: string): Observable<any> {
    return of();
  }
  getAllIdentityAttributes(): Observable<any> {
    return of();
  }

  updateAttributeIndex(_attribute: IdentityAttribute): Observable<any> {
    return of();
  }

  getAllTransforms(): Observable<any> {
    return of();
  }

  getTransformById(_transformId: string): Observable<any> {
    return of();
  }
  updateTransform(_transform: Transform): Observable<any> {
    return of();
  }

  deleteTransform(_transformId: string): Observable<any> {
    return of();
  }

  createTransform(_transform: Transform): Observable<any> {
    return of();
  }

  getSourceCreateProfile(_sourceId: string): Observable<any> {
    return of();
  }

  createSourceCreateProfile(
    _sourceId: string,
    _attribute: string
  ): Observable<any> {
    return of();
  }

  createSourceCreateProfileAttribute(
    _sourceId: string,
    _attribute: string
  ): Observable<any> {
    return of();
  }

  deleteSourceCreateProfileAttribute(
    _sourceId: string,
    _attributeJSONIndex: number
  ): Observable<any> {
    return of();
  }

  getAccessRequestStatus(): Observable<any> {
    return of();
  }

  getAccessRequestApprovalsPending(): Observable<any> {
    return of();
  }

  forwardAccessRequestApproval(
    _approvalToForwardId: string,
    _newOwnerId: string,
    _comment: string
  ): Observable<any> {
    return of();
  }

  getWorkItemsPending(): Observable<any> {
    return of();
  }

  getWorkItemsCompleted(): Observable<any> {
    return of();
  }
  getWorkItemsSummary(): Observable<any> {
    return of();
  }

  forwardPendingWorkItem(
    _workItemId: string,
    _newOwnerId: string,
    _comment: string
  ): Observable<any> {
    return of();
  }

  getAccessRequestApprovalsSummary(): Observable<any> {
    return of();
  }

  getIdentityProfile(_profileId: string): Observable<any> {
    return of();
  }

  getIdentityProfileLCS(_profileId: string): Observable<any> {
    return of();
  }

  deleteIdentityProfileLCS(
    _profileId: string,
    _lcsId: string
  ): Observable<any> {
    return of();
  }

  refreshSingleIdentity(_identityId: string): Observable<any> {
    return of();
  }
}
