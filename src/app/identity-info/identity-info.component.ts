import { Component, OnInit, ViewChild } from '@angular/core';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { SimpleQueryCondition } from '../model/simple-query-condition';
import { PageResults } from '../model/page-results';
import { EntitlementSimple } from '../model/entitlement-simple';
import { Account } from '../model/account';
import { AccessRequestStatus } from '../model/access-request-status';
import { IdentityAttribute } from '../model/identity-attribute';
import { AuthenticationService } from '../service/authentication-service.service';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';
import { WorkItem } from '../model/work-item';
import { IdentityActions } from '../model/IdentityActions';
import { AccountActivities } from '../model/accountactivities';
import { RevokeRole, RevokeRoleItem } from '../model/revokeRole';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Entitlement } from '../model/entitlement';
import { ActivatedRoute } from '@angular/router';
import {
  AccessRequestAudit,
  AccessRequestAuditAccount,
} from '../model/AccessRequestAudit';

@Component({
  selector: 'app-identity-info',
  templateUrl: './identity-info.component.html',
  styleUrls: ['./identity-info.component.css'],
})
export class IdentityInfoComponent implements OnInit {
  oneRequest: AccessRequestStatus;
  roleDetailsEnt: Array<EntitlementSimple>;
  roleDetailsEntCount: number;

  userComment: string;
  tempRevoke: Entitlement;
  tempRevokeType: string;
  loading: boolean;
  allOwnersFetched: boolean;
  errorMessage: string;
  invalidMessage: string[];
  validToSubmit: boolean;

  rawActivities: string;
  rawWorkItem: string;
  auditDetails: AccessRequestAudit;

  //newsearch options
  accountName: string;
  lastName: string;
  firstName: string;
  email: string;
  managerName: string;

  identityInfo: IdentityAttribute;
  filterTypes: Array<string>;
  selectedFilterTypes: string;
  identityList: Array<IdentityAttribute>;
  identityActions: Array<IdentityActions>;

  //Pages
  page: PageResults;

  accessRequestStatuses: AccessRequestStatus[];
  workItemsStatuses: WorkItem[];
  entitlements: Array<{}>;

  searchText: string;
  searchText2: string;
  rawAccessRequest: string;

  //Visualization
  provisioningData: boolean;
  syncData: boolean;

  constructor(
    private idnService: IDNService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private activateRoute: ActivatedRoute
  ) {}

  @ViewChild('revokeRequest', { static: false })
  revokeRequest: ModalDirective;

  @ViewChild('roleDetailsModal', { static: false })
  roleDetailsModal: ModalDirective;

  @ViewChild('auditDetailsModal', { static: false })
  auditDetailsModal: ModalDirective;

  @ViewChild('accessRequestDetails', { static: false })
  accessRequestDetails: ModalDirective;

  ngOnInit() {
    this.auditDetails = new AccessRequestAudit();
    this.tempRevoke = new Entitlement();
    this.page = new PageResults();
    this.selectedFilterTypes = 'name';
    this.filterTypes = Array<string>();
    if (localStorage.getItem('identityAttributes') == null) {
      this.initFilterTypes();
    } else {
      this.filterTypes = JSON.parse(localStorage.getItem('identityAttributes'));
    }
    this.reset(true);
    this.activateRoute.queryParams.subscribe(params => {
      const field = params['field'];
      if (field != null) {
        this.filterTypes.push(field);
        this.selectedFilterTypes = field;
      }
      const searchData = params['searchData'];
      if (searchData != null) {
        this.accountName = searchData;
        this.submit();
      }
    });
  }

  initFilterTypes() {
    this.filterTypes.push('name');
    //this.filterTypes.push('firstname');
    // this.filterTypes.push('lastname');
    //this.filterTypes.push('identificationNumber');
    //this.filterTypes.push('email');
    //this.filterTypes.push('phone');
    //this.filterTypes.push('manager');

    this.idnService.searchableAttributes().subscribe(response => {
      const searchResult = response.body;
      const headers = response.headers;
      this.page.xTotalCount = headers.get('X-Total-Count');
      //Lets not load the data if we have more than one result
      const names = new Array();
      for (let i = 0; i < searchResult.length; i++) {
        names.push(searchResult[i].name);
      }
      names.sort();
      for (let i = 0; i < names.length; i++) {
        this.filterTypes.push(names[i]);
      }
      localStorage.setItem(
        'identityAttributes',
        JSON.stringify(this.filterTypes)
      );
    });
    /*
    This is optional but you can pass a set of attributes
    you want to search on like departement.  This will
    be a simple method that you can test any search
    options you need.  
    */
    const attributues = process.env.NG_APP_IDENTITY_SEARCH;
    if (attributues) {
      const split = attributues.split(',');
      let i = 0;
      while (split.length > i) {
        this.filterTypes.push(split[i]);
        i++;
      }
    }
  }

  /**
   * Copy these three functions to any
   * page you want to have paggination
   */
  //Get the next page
  getNextPage() {
    this.page.nextPage;
    this.submit();
  }
  //Get the previous page
  getPrevPage() {
    this.page.prevPage;
    this.submit();
  }
  //Pick the page Number you want
  getOnePage(input) {
    this.page.getPageByNumber(input - 1);
    this.submit();
  }

  pickData(input) {
    this.oneRequest = null;
    this.oneRequest = this.accessRequestStatuses[input];
    this.accessRequestDetails.show();
  }
  reset(clearMsg: boolean) {
    this.oneRequest = null;
    this.loading = false;
    this.provisioningData = false;
    this.syncData = false;
    this.allOwnersFetched = false;
    this.invalidMessage = [];
    this.identityInfo = null;
    this.accountName = null;
    this.firstName = null;
    this.lastName = null;
    this.managerName = null;
    this.email = null;
    if (clearMsg) {
      this.messageService.clearAll();
      this.errorMessage = null;
    }
    this.identityList = null;
    this.searchText = null;
    this.searchText2 = null;
  }

  /*
  If we get more than one user from the API
  when you click the show details button
  it will show just that users details
  */
  showDetailsFromList(item) {
    this.page = new PageResults();
    const value = new Array<IdentityAttribute>();
    value.push(this.identityList[item]);
    this.identityList = null;
    this.messageService.clearAll();
    this.getIdentityInfo(value);
  }
  showRawActivity(input) {
    this.rawActivities = this.identityInfo.activities[input].raw;
  }

  showRawWorkItem(input) {
    this.rawWorkItem = this.workItemsStatuses[input].rawObject;
  }

  showRawAccessRequest(input) {
    const jsonText = JSON.stringify(
      this.accessRequestStatuses[input].raw,
      null,
      4
    );
    this.rawAccessRequest = jsonText;
  }
  clearAccessRequestDetails() {
    this.rawAccessRequest = null;
  }

  clearProvisionDetails() {
    this.rawActivities = null;
    this.rawWorkItem = null;
  }

  getSyncData() {
    this.idnService
      .sinkByPerson(this.identityInfo.name)
      .subscribe(searchResult => {
        for (let i = 0; i < searchResult.length; i++) {
          const ia = new IdentityActions();
          const rawData = searchResult[i];
          ia.trigger = 'SYNC';
          ia.created = rawData.created;
          //attributeName
          ia.name = rawData.attributes.attributeName;
          ia.value = rawData.attributes.attributeValue;
          ia.op = rawData.attributes.operation;
          ia.source = rawData.attributes.sourceName;
          this.identityActions.push(ia);
        }
        this.syncData = true;
      });
  }

  getProvisionActions() {
    this.rawActivities = null;
    this.identityActions = new Array<IdentityActions>();
    this.identityInfo.activities = new Array<AccountActivities>();
    const queryString =
      'recipient.name:"' + this.identityInfo.displayName + '"';

    this.idnService.searchActivites(queryString).subscribe(response => {
      const searchResult = response.body;
      //Lets not load the data if we have more than one result

      for (let i = 0; i < searchResult.length; i++) {
        this.filterTypes.push(searchResult[i].name);
        const ac = new AccountActivities();
        ac.action = searchResult[i].action;
        ac.id = searchResult[i].id;
        ac.requester = searchResult[i].requester.name;
        ac.stage = searchResult[i].stage;
        ac.modified = searchResult[i].modified;
        ac.status = searchResult[i].status;
        ac.source = searchResult[i].sources;
        const accReq = searchResult[i].accountRequests;
        //Section to find the snow ticket and show details
        let snowTicket = null;
        if (accReq) {
          for (let a = 0; a < accReq.length; a++) {
            const arItem = accReq[a];
            if (arItem.result) {
              if (arItem.result.ticketId) {
                snowTicket = arItem.result.ticketId;
              }
            }
          }
        }
        const items = searchResult[i].expansionItems;
        if (items) {
          for (let ii = 0; ii < items.length; ii++) {
            const item = items[ii];
            const ia = new IdentityActions();
            if (item.name) {
              ia.name = item.name;
            }
            if (searchResult[i].created) {
              ia.created = searchResult[i].created;
            }
            //Created is the date of the access request.  Modified is what we want if access requested
            if (searchResult[i].modified) {
              ia.created = searchResult[i].modified;
            }
            if (searchResult[i].action) {
              const trigger = searchResult[i].action.toString();
              ia.trigger = trigger;
              if (trigger === 'Access Request') {
                ia.trigger = 'User';
              }
              if (trigger === 'Identity Refresh') {
                ia.trigger = 'System';
              }
            }

            if (item.attributeRequest) {
              if (item.attributeRequest.op) {
                if (snowTicket != null) {
                  ia.op = item.attributeRequest.op + '  (' + snowTicket + ')';
                } else {
                  ia.op = item.attributeRequest.op;
                }
              }
              if (item.attributeRequest.value) {
                ia.value = item.attributeRequest.value;
              }
              if (item.attributeRequest.name) {
                ia.name = item.attributeRequest.name;
              }
            }
            if (item.source) {
              if (item.source.name) {
                ia.source = item.source.name;
              }
            }
            if (item.result) {
              ia.source = ia.source + ':' + item.result.ticketId;
            }
            this.identityActions.push(ia);
          }
        }
        if (searchResult[i].errors != null) {
          ac.errors = searchResult[i].errors;
        }
        ac.raw = JSON.stringify(searchResult[i], null, 4);

        this.identityInfo.activities.push(ac);
      }
      this.provisioningData = true;
      this.getSyncData();
    });
  }

  submit() {
    this.provisioningData = false;
    this.syncData = false;
    this.identityInfo = null;
    this.messageService.clearError();
    this.validToSubmit = true;
    this.invalidMessage = [];
    this.loading = true;
    this.identityList = null;

    const query = new SimpleQueryCondition();
    query.firstName = this.firstName;
    query.lastName = this.lastName;
    query.email = this.email;
    query.managerName = this.managerName;
    let attributes = true;
    if (this.selectedFilterTypes == 'name') {
      query.attribute = this.selectedFilterTypes;
      attributes = false;
    }
    if (this.selectedFilterTypes == 'manager') {
      query.attribute = this.selectedFilterTypes + '.name';
      attributes = false;
    }
    if (attributes == true) {
      query.attribute = 'attributes.' + this.selectedFilterTypes;
    }

    query.value = this.accountName;

    this.idnService
      .searchAccountsPaged(query, this.page)
      .subscribe(response => {
        const searchResult = response.body;
        const headers = response.headers;
        this.page.xTotalCount = headers.get('X-Total-Count');
        //Lets not load the data if we have more than one result
        if (
          (searchResult && searchResult.length > 1) ||
          this.page.offset != 0
        ) {
          this.messageService.setError(
            `Multiple records found. Click 'Show Details' to select the record.`
          );
          this.identityList = searchResult;
        }

        if (searchResult && searchResult.length == 1 && this.page.offset == 0) {
          this.getIdentityInfo(searchResult);
        }

        if (searchResult && searchResult.length == 0) {
          this.validToSubmit = false;
          this.messageService.setError(`Record not found.`);
        }
      });

    this.loading = false;
  }

  getIdentityInfo(identity) {
    this.identityInfo = new IdentityAttribute();

    this.identityInfo.id = identity[0].id;

    this.identityInfo.name = identity[0].name;
    this.identityInfo.displayName = identity[0].displayName;
    this.identityInfo.email = identity[0].email;
    this.identityInfo.created = identity[0].created;
    this.identityInfo.employeeNumber = identity[0].employeeNumber;

    if (identity[0].manager) {
      this.identityInfo.managerDisplayName = identity[0].manager.displayName;
      this.identityInfo.managerAccountName = identity[0].manager.name;
    }

    this.identityInfo.isManager = identity[0].isManager;
    this.identityInfo.cloudLifecycleState =
      identity[0].attributes.cloudLifecycleState;
    this.identityInfo.cloudStatus = identity[0].attributes.cloudStatus;
    this.identityInfo.identityProfile = identity[0].identityProfile.name;

    if (identity[0].accountCount) {
      this.identityInfo.accountCount = identity[0].accountCount;
      this.identityInfo.accountSourceNames = identity[0].accounts
        .map(each => each.source.name)
        .join('; ');
    }

    //Account Details
    if (identity[0].accountCount) {
      this.identityInfo.accountCount = identity[0].accountCount;

      const accounts = identity[0].accounts;
      this.identityInfo.accountArray = new Array<Account>();
      for (let i = 0; i < accounts.length; i++) {
        const data = {} as Account;
        data.accountId = accounts[i].accountId;
        data.accountName = accounts[i].name;
        data.accountDisabled = accounts[i].disabled;
        data.sourceName = accounts[i].source.name;
        if (data.sourceName == 'IdentityNow') {
          if (
            accounts[i].entitlementAttributes != null &&
            accounts[i].entitlementAttributes.assignedGroups != null
          ) {
            this.identityInfo.orgPermission =
              accounts[i].entitlementAttributes.assignedGroups;
          }
        }
        data.sourceId = accounts[i].source.id;

        this.identityInfo.accountArray.push(data);
      }
      //Sort by sourceName
      this.identityInfo.accountArray.sort((a, b) =>
        a.sourceName.localeCompare(b.sourceName)
      );
    }
    //All Identity Attributes into simple name value array
    if (identity[0].attributes) {
      this.identityInfo.attributes = new Array();
      const atts = Object.entries(identity[0].attributes);
      for (let i = 0; i < atts.length; i++) {
        const [name, value] = atts[i];
        this.identityInfo.attributes.push({
          name: name,
          value: value.toString(),
        });
      }
      this.identityInfo.attributes.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (identity[0].appCount) {
      this.identityInfo.appCount = identity[0].appCount;
      this.identityInfo.appNames = identity[0].apps
        .map(each => each.name)
        .join('; ');
    }

    this.identityInfo.accessCount = identity[0].accessCount;

    if (identity[0].roleCount) {
      this.identityInfo.roleCount = identity[0].roleCount;

      this.identityInfo.roleNames = identity[0].access
        .filter(each => each.type === 'ROLE')
        .map(each => each.displayName)
        .join('; ');
      this.identityInfo.roleArray = identity[0].access.filter(
        each => each.type === 'ROLE'
      );
      this.identityInfo.roleArray.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (identity[0].accessProfileCount) {
      this.identityInfo.accessProfileCount = identity[0].accessProfileCount;
      this.identityInfo.accessProfileNames = identity[0].access
        .filter(each => each.type === 'ACCESS_PROFILE')
        .map(each => each.displayName)
        .join('; ');

      this.identityInfo.accessProfileArray = identity[0].access.filter(
        each => each.type === 'ACCESS_PROFILE'
      );
    }

    if (identity[0].entitlementCount) {
      this.identityInfo.entitlementCount = identity[0].entitlementCount;
      this.identityInfo.entitlementNames = identity[0].access
        .filter(each => each.type === 'ENTITLEMENT')
        .map(each => each.displayName)
        .join('; ');
    }

    /*
    Section for the entitlement details page.  Not sure
    if this is best or if I should do it in the html but kind of
    nice to have simple object
    */
    if (identity[0].entitlementCount) {
      this.identityInfo.entitlementCount = identity[0].entitlementCount;
      const ents = identity[0].access.filter(
        each => each.type === 'ENTITLEMENT'
      );
      this.identityInfo.entitlementArray = new Array();
      for (let i = 0; i < ents.length; i++) {
        const data = {} as EntitlementSimple;
        data.displayName = ents[i].displayName;
        data.description = ents[i].description;
        data.attribute = ents[i].attribute;
        data.sourceName = ents[i].source.name;
        data.id = ents[i].id;

        this.identityInfo.entitlementArray.push(data);
      }

      this.identityInfo.entitlementArray.sort((a, b) =>
        a.displayName.localeCompare(b.displayName)
      );
      this.identityInfo.entitlementArray.sort((a, b) =>
        a.attribute.localeCompare(b.attribute)
      );
      this.identityInfo.entitlementArray.sort((a, b) =>
        a.sourceName.localeCompare(b.sourceName)
      );
    }

    if (identity[0].tagsCount) {
      this.identityInfo.tagsCount = identity[0].tagsCount;
      this.identityInfo.tagNames = identity[0].tags.join('; ');
    }

    if (identity[0].owns) {
      if (identity[0].owns.sources) {
        this.identityInfo.ownSources = identity[0].owns.sources.length;
        this.identityInfo.ownSourcesNames = identity[0].owns.sources
          .map(each => each.name)
          .join('; ');
        this.identityInfo.ownsSourcesArray = identity[0].owns.sources;
      }
      if (identity[0].owns.accessProfiles) {
        this.identityInfo.ownAccessProfiles =
          identity[0].owns.accessProfiles.length;
        this.identityInfo.ownAccessProfilesNames =
          identity[0].owns.accessProfiles.map(each => each.name).join('; ');
        this.identityInfo.ownsAccessProfilesArray =
          identity[0].owns.accessProfiles;
      }
      if (identity[0].owns.apps) {
        this.identityInfo.ownApps = identity[0].owns.apps.length;
        this.identityInfo.ownAppsNames = identity[0].owns.apps
          .map(each => each.name)
          .join('; ');
      }
      if (identity[0].owns.roles) {
        this.identityInfo.ownRoles = identity[0].owns.roles.length;
        this.identityInfo.ownRolesNames = identity[0].owns.roles
          .map(each => each.name)
          .join('; ');
        this.identityInfo.ownsRolesArray = identity[0].owns.roles;
      }
      if (identity[0].owns.governanceGroups) {
        this.identityInfo.ownGovernanceGroups =
          identity[0].owns.governanceGroups.length;
        this.identityInfo.ownGovernanceGroupsNames =
          identity[0].owns.governanceGroups.map(each => each.name).join('; ');
        this.identityInfo.ownsGovernanceGroupsArray =
          identity[0].owns.governanceGroups;
      }
    }
    /*this.idnService
      .getUserByAlias(this.identityInfo.name)
      .subscribe(userDetail => {
        this.identityInfo.orgPermission = userDetail.role.join('; ');
      });
      */

    //Get recent access requests
    this.getAllAccessRequestStatus();
    this.getAllWorkItemsStatus();
    this.getOwnedEntitlements();
    this.getProvisionActions();
  }

  getOwnedEntitlements() {
    this.idnService.getEntilementsPaged(null, this.page).subscribe(response => {
      const searchResult = response.body;
      //const headers = response.headers;
      //Might need named object in the future
      this.entitlements = searchResult;
    });
  }

  getAllAccessRequestStatus() {
    const filters = '&requested-for=' + this.identityInfo.id;
    this.idnService.getAccessRequestStatus(filters).subscribe(results => {
      this.accessRequestStatuses = [];
      for (const each of results) {
        const accessRequestStatus = new AccessRequestStatus();
        accessRequestStatus.accessName = each.name;
        accessRequestStatus.accessType = each.type;
        accessRequestStatus.requestType = each.requestType;
        accessRequestStatus.state = each.state;
        accessRequestStatus.created = each.created;
        accessRequestStatus.requester = each.requester.name;
        accessRequestStatus.requestedFor = each.requestedFor.name;
        accessRequestStatus.approvalDetails = each.approvalDetails;
        accessRequestStatus.accessRequestPhases = each.accessRequestPhases;
        accessRequestStatus.raw = each;
        accessRequestStatus.id = each.accessRequestId;

        if (each.requesterComment && each.requesterComment.comment) {
          accessRequestStatus.requesterComment = each.requesterComment.comment;
        }

        if (each.sodViolationContext && each.sodViolationContext.state) {
          accessRequestStatus.sodViolationState =
            each.sodViolationContext.state;
        }

        this.accessRequestStatuses.push(accessRequestStatus);
      }
      this.loading = false;
    });
  }

  getAllWorkItemsStatus() {
    const filters = '&ownerId=' + this.identityInfo.id;
    this.workItemsStatuses = [];
    this.idnService.getWorkItemsStatus(filters).subscribe(results => {
      for (const each of results) {
        const workItemsStatus = new WorkItem();
        workItemsStatus.id = each.id;
        workItemsStatus.created = each.created;
        workItemsStatus.description = each.description;
        workItemsStatus.state = each.state;
        workItemsStatus.type = each.type;
        workItemsStatus.rawObject = JSON.stringify(each, null, 4);

        if (each.remediationItems && each.remediationItems.length) {
          workItemsStatus.remediationItems = each.remediationItems.length;
        } else {
          workItemsStatus.remediationItems = '0';
        }

        if (each.approvalItems && each.approvalItems.length) {
          workItemsStatus.approvalItems = each.approvalItems.length;
        } else {
          workItemsStatus.approvalItems = '0';
        }

        const query = new SimpleQueryCondition();
        query.attribute = 'name';

        if (each.ownerName) {
          query.value = each.ownerName;

          this.idnService.searchAccounts(query).subscribe(searchResult => {
            if (searchResult.length > 0) {
              workItemsStatus.ownerDisplayName = searchResult[0].displayName;
            } else {
              workItemsStatus.ownerDisplayName = 'NULL';
            }
          });
        } else {
          workItemsStatus.ownerDisplayName = 'NULL';
        }

        if (each.requesterDisplayName) {
          query.value = each.requesterDisplayName;

          this.idnService.searchAccounts(query).subscribe(searchResult => {
            if (searchResult.length > 0) {
              workItemsStatus.requesterDisplayName =
                searchResult[0].displayName;
            } else {
              workItemsStatus.requesterDisplayName = 'NULL';
            }
          });
        } else {
          workItemsStatus.requesterDisplayName = 'NULL';
        }

        this.workItemsStatuses.push(workItemsStatus);
      }
      this.loading = false;
    });

    //Get approvals
    this.idnService
      .getAccessRequestApprovalsPendingUser(this.identityInfo.id)
      .subscribe(results => {
        for (const each of results) {
          const workItemsStatus = new WorkItem();
          workItemsStatus.type = 'Approval';
          workItemsStatus.description = 'approval:';
          if (each.requestedObject != null) {
            workItemsStatus.description =
              workItemsStatus.description + each.requestedObject.name + ':';
          }
          workItemsStatus.description = workItemsStatus.description + each.name;
          workItemsStatus.id = each.id;
          workItemsStatus.created = each.created;
          workItemsStatus.rawObject = JSON.stringify(each, null, 4);
          if (
            each.sodViolationContext != null &&
            each.sodViolationContext.violationCheckResult != null
          ) {
            workItemsStatus.state =
              each.sodViolationContext.violationCheckResult.clientMetadata.workflowCaseId;
          } else {
            workItemsStatus.state = 'Approvals';
          }
          this.workItemsStatuses.push(workItemsStatus);
        }
      });
    //getAccessRequestApprovalsPendingUser
  }

  getManagerInfo() {
    this.accountName = this.identityInfo.managerAccountName;
    this.firstName = null;
    this.lastName = null;
    this.managerName = null;
    this.email = null;
    this.selectedFilterTypes = 'name';
    this.submit();
  }

  revokeRole(id) {
    this.tempRevoke = id;
    this.tempRevokeType = 'ROLE';
    this.revokeRequest.show();
    //this.revoke(id, 'ROLE');
  }

  revokeEntitlement(id) {
    this.tempRevoke = id;
    this.tempRevokeType = 'ENTITLEMENT';
    console.log(id);
    this.revokeRequest.show();
  }

  cancelRevoke() {
    this.tempRevoke = null;
    this.tempRevokeType = null;
    this.revokeRequest.hide();
  }

  showRawAudit(input, modal: boolean) {
    this.auditDetails = new AccessRequestAudit();
    this.auditDetails.applications = [];
    const ticket = this.accessRequestStatuses[input].id;
    this.auditDetails.id = ticket;
    console.log(ticket);
    this.idnService.searchIdentityRequestAudit(ticket).subscribe(data => {
      const jsonText = JSON.stringify(data, null, 4);
      if (modal == false) {
        this.rawAccessRequest = jsonText;
      } else {
        const raw = data[0];
        this.auditDetails.status = raw.status;
        this.auditDetails.created = raw.created;
        this.auditDetails.modified = raw.modified;
        this.auditDetails.requester = raw.requester.name;
        this.auditDetails.recipient = raw.recipient.name;

        this.auditDetails.sources = raw.sources;
        this.auditDetails.errors = raw.errors;
        this.auditDetails.warnings = raw.warnings;

        if (raw.accountRequests) {
          for (let i = 0; i < raw.accountRequests.length; i++) {
            const reg = raw.accountRequests[i];
            const account = new AccessRequestAuditAccount();
            account.accountId = reg.accountId;
            account.op = reg.op;
            account.source = reg.source.name;
            account.status = reg.result.status;
            if (reg.result) {
              if (reg.result.errors) {
                account.status = reg.result.status;
                account.errors = reg.result.errors;
              }
            }
            for (let a = 0; a < reg.attributeRequests.length; a++) {
              const audit = this.cloneAuditDetails(account);
              const ar = reg.attributeRequests[a];
              audit.name = ar.name;
              audit.value = ar.value;
              audit.op = ar.op;
              //account.errors = "";
              if (ar.result) {
                if (ar.result.status != null) {
                  audit.errors = ar.result.status + ':';
                }
                if (ar.result.errors) {
                  audit.errors = account.errors + ar.result.errors;
                }
              }
              this.auditDetails.applications.push(audit);
            }
          }
        }
        if (raw.errors) {
          this.auditDetails.errors;
        }

        this.auditDetailsModal.show();
      }
    });
  }

  private cloneAuditDetails(account: AccessRequestAuditAccount) {
    const audit = new AccessRequestAuditAccount();
    audit.accountId = account.accountId;
    audit.op = account.op;
    audit.source = account.source;
    audit.status = account.status;
    audit.errors = account.errors;
    return audit;
  }

  cancelAuditDetails() {
    this.tempRevoke = null;
    this.tempRevokeType = null;
    this.auditDetailsModal.hide();
    this.accessRequestDetails.hide();
  }

  cancelRoleDetails() {
    this.tempRevoke = null;
    this.tempRevokeType = null;
    this.roleDetailsModal.hide();
  }
  roleDetailsSub(item, showEmpty: boolean) {
    this.idnService.getRoleDetails(item.id).subscribe(data => {
      for (const each of data.entitlements) {
        const es = new EntitlementSimple();
        es.id = each.id;
        es.displayName = each.name;
        let found = 'false';
        //roleDetailsEnt: Array<EntitlementSimple>;
        for (const master of this.identityInfo.entitlementArray) {
          const data = master as EntitlementSimple;
          if (data.id == es.id) {
            found = 'true';
          }
        }
        es.attribute = found;
        this.roleDetailsEnt.push(es);
      }
      if (this.roleDetailsEnt.length == 0 && showEmpty) {
        const es = new EntitlementSimple();
        es.displayName = 'No Direct Entitlements';
        this.roleDetailsEnt.push(es);
      }
      this.roleDetailsEnt.sort((a, b) =>
        a.displayName.localeCompare(b.displayName)
      );
    });
  }

  async roleDetails(item): Promise<any> {
    this.roleDetailsModal.show();
    this.roleDetailsEntCount = 0;
    this.roleDetailsEnt = new Array();
    this.roleDetailsModal.show();
    const test = await this.roleDetailsSub(item, true);
    console.log(test);
    this.roleDetailsEntCount++;
  }

  async totalRoleAccess(): Promise<any> {
    this.roleDetailsEnt = new Array();
    this.roleDetailsEntCount = 0;
    this.roleDetailsModal.show();
    //for (const each of data.entitlements) {
    for (const item of this.identityInfo.roleArray) {
      this.roleDetailsEntCount++;
      const test = await this.roleDetailsSub(item, false);
      console.log('Procs' + test);
      await this.sleep(1000);
    }
  }

  async processOneOprhanRole(item): Promise<any> {
    this.idnService.getRoleDetails(item.id).subscribe(data => {
      for (const each of data.entitlements) {
        for (let i = 0; i < this.roleDetailsEnt.length; i++) {
          if (this.roleDetailsEnt[i].id == each.id) {
            this.roleDetailsEnt[i].attribute = 'true';
            console.log('remove:' + this.roleDetailsEnt[i].displayName);
            //this.roleDetailsEnt.splice(index - 1, 1);
          }
        }
      }

      this.roleDetailsEntCount++;
    });
    return item.name;
  }

  /**
   * Having some trouble with the system running the request in
   * order.  I think I have something to learn about
   * making a call run in the correct order.
   */
  async orphanAccess(): Promise<any> {
    this.roleDetailsEnt = new Array();
    this.roleDetailsEntCount = 0;
    for (const oneEnt of this.identityInfo.entitlementArray) {
      const es = new EntitlementSimple();
      es.sourceName = oneEnt.sourceName;
      es.id = oneEnt.id;
      es.displayName = oneEnt.displayName;
      es.attribute = 'false';
      this.roleDetailsEnt.push(es);
    }

    //for (const each of data.entitlements) {
    for (const item of this.identityInfo.roleArray) {
      const test = await this.processOneOprhanRole(item);
      console.log(test);
      await this.sleep(1000);
      this.roleDetailsModal.show();
      //this.roleDetailsEnt = roleDetailsFull;
    }
  }

  cleanFalse() {
    const roleDetailsClean = new Array();
    for (const item of this.roleDetailsEnt) {
      if (item != null && item.attribute === 'false') {
        roleDetailsClean.push(item);
      }
    }
    this.roleDetailsEnt = roleDetailsClean;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  revoke(id, type) {
    const r = new RevokeRole();
    r.requestType = 'REVOKE_ACCESS';
    const people = new Array();
    people.push(this.identityInfo.id);
    r.requestedFor = people;
    const item = new RevokeRoleItem();
    item.id = id;
    if (this.userComment == null) {
      this.userComment = '';
    }
    item.comment = 'Admin Tool:' + this.userComment;
    item.type = type;
    const items = new Array();
    items.push(item);
    r.requestedItems = items;
    this.idnService.revokeRole(r).subscribe(data => {
      window.alert('submited:' + data);
    });
  }

  refreshIdentity() {
    if (this.identityInfo.name && this.identityInfo.name.trim() != '') {
      this.idnService.refreshSingleIdentity(this.identityInfo.name).subscribe(
        () => {
          this.messageService.add(`Triggered Background Identity Refresh`);
        },
        err => {
          this.messageService.handleIDNError(err);
        }
      );
    }
  }

  syncIdentity() {
    if (this.identityInfo.name && this.identityInfo.id.trim() != '') {
      this.idnService.syncSingleIdentity(this.identityInfo.id).subscribe(
        () => {
          this.messageService.add(`Triggered Background Identity Sync`);
        },
        err => {
          this.messageService.handleIDNError(err);
        }
      );
    }
  }

  getEntitlementDetails(input) {
    this.idnService.getEntitlement(input).subscribe(data => {
      window.alert(data.source.name);
    });
  }

  saveInCsv() {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useHeader: true,
      headers: ['Description', 'Value'],
      nullToEmptyString: true,
    };

    const currentUser = this.authenticationService.currentUserValue;
    const fileName = `${currentUser.tenant}-${this.identityInfo.name}-identity-info`;

    // const arr = [];
    const arr = [
      {
        Description: 'Export Date',
        Value: Date(),
      },
      {
        Description: 'ID',
        Value: this.identityInfo.id,
      },
      {
        Description: 'Display Name',
        Value: this.identityInfo.displayName,
      },
      {
        Description: 'Employee Number',
        Value: this.identityInfo.employeeNumber,
      },
      {
        Description: 'Email Address',
        Value: this.identityInfo.email,
      },
      {
        Description: 'Lifecycle State',
        Value: this.identityInfo.cloudLifecycleState,
      },
      {
        Description: 'Cloud Status',
        Value: this.identityInfo.cloudStatus,
      },
      {
        Description: 'Manager',
        Value: this.identityInfo.managerDisplayName,
      },
      {
        Description: 'Created in IDN',
        Value: this.identityInfo.created,
      },
      {
        Description: 'Is A Manager',
        Value: this.identityInfo.isManager,
      },
      {
        Description: 'Identity Profile',
        Value: this.identityInfo.identityProfile,
      },
      {
        Description: 'Org Permission',
        Value: this.identityInfo.orgPermission,
      },
      {
        Description: 'Counts',
      },
      {
        Description: 'Accounts',
        Value: this.identityInfo.accountCount,
      },
      {
        Description: 'Account Source Names',
        Value: this.identityInfo.accountSourceNames,
      },
      {
        Description: 'Applications',
        Value: this.identityInfo.appCount,
      },
      {
        Description: 'Application Names',
        Value: this.identityInfo.appNames,
      },
      {
        Description: 'Total Access (Entitlements / AP / Roles)',
        Value: this.identityInfo.accessCount,
      },
      {
        Description: 'Roles',
        Value: this.identityInfo.roleCount,
      },
      {
        Description: 'Role Names',
        Value: this.identityInfo.roleNames,
      },
      {
        Description: 'Access Profiles',
        Value: this.identityInfo.accessProfileCount,
      },
      {
        Description: 'Access Profile Names',
        Value: this.identityInfo.accessProfileNames,
      },
      {
        Description: 'Entitlements',
        Value: this.identityInfo.entitlementCount,
      },
      {
        Description: 'Entitlement Names',
        Value: this.identityInfo.entitlementNames,
      },
      {
        Description: 'Tags',
        Value: this.identityInfo.tagsCount,
      },
      {
        Description: 'Tag Names',
        Value: this.identityInfo.tagNames,
      },
      {
        Description: 'Owns',
      },
      {
        Description: 'Sources',
        Value: this.identityInfo.ownSources,
      },
      {
        Description: 'Source Names',
        Value: this.identityInfo.ownSourcesNames,
      },
      {
        Description: 'Access Profiles',
        Value: this.identityInfo.ownAccessProfiles,
      },
      {
        Description: 'Access Profiles Names',
        Value: this.identityInfo.ownAccessProfilesNames,
      },
      {
        Description: 'Applications',
        Value: this.identityInfo.ownApps,
      },
      {
        Description: 'Applications Names',
        Value: this.identityInfo.ownAppsNames,
      },
      {
        Description: 'Roles',
        Value: this.identityInfo.ownRoles,
      },
      {
        Description: 'Role Names',
        Value: this.identityInfo.ownRolesNames,
      },
      {
        Description: 'Governance Groups',
        Value: this.identityInfo.ownGovernanceGroups,
      },
      {
        Description: 'Governance Groups Names',
        Value: this.identityInfo.ownGovernanceGroupsNames,
      },
    ];

    new AngularCsv(arr, fileName, options);
  }

  roleDetailsCSV() {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useHeader: true,
      headers: ['id', 'displayName', 'attribute'],
      nullToEmptyString: true,
    };

    const currentUser = this.authenticationService.currentUserValue;
    const fileName = `${currentUser.tenant}-${this.identityInfo.name}-rolesDetails`;

    new AngularCsv(this.roleDetailsEnt, fileName, options);
  }

  roleDetailsEntitlements() {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useHeader: true,
      nullToEmptyString: true,
    };

    const currentUser = this.authenticationService.currentUserValue;
    const fileName = `${currentUser.tenant}-${this.identityInfo.name}-entDetails`;

    new AngularCsv(this.identityInfo.entitlementArray, fileName, options);
  }

  auditToCsv() {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useHeader: true,
      nullToEmptyString: true,
    };

    const currentUser = this.authenticationService.currentUserValue;
    const fileName = `${currentUser.tenant}-${this.identityInfo.name}-audit-${this.auditDetails.id}`;

    new AngularCsv(this.auditDetails.applications, fileName, options);
  }

  provisioningActions() {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useHeader: true,
      nullToEmptyString: true,
    };

    const currentUser = this.authenticationService.currentUserValue;
    const fileName = `${currentUser.tenant}-${this.identityInfo.name}-provisioning`;

    new AngularCsv(this.identityActions, fileName, options);
  }
  //identityActions
}
