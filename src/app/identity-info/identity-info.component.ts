import { Component, OnInit } from '@angular/core';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { SimpleQueryCondition } from '../model/simple-query-condition';
import { IdentityAttribute } from '../model/identity-attribute';
import { AuthenticationService } from '../service/authentication-service.service';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';

@Component({
  selector: 'app-identity-info',
  templateUrl: './identity-info.component.html',
  styleUrls: ['./identity-info.component.css'],
})
export class IdentityInfoComponent implements OnInit {
  loading: boolean;
  allOwnersFetched: boolean;
  errorMessage: string;
  invalidMessage: string[];
  validToSubmit: boolean;

  //new
  accountName: string;
  identityInfo: IdentityAttribute;
  filterTypes: Array<string>;
  selectedFilterTypes: string;
  identityList: Array<IdentityAttribute>;

  constructor(
    private idnService: IDNService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.selectedFilterTypes = 'name';
    this.filterTypes = Array<string>();
    this.initFilterTypes();
    this.reset(true);
  }

  initFilterTypes() {
    this.filterTypes.push('name');
    this.filterTypes.push('firstname');
    this.filterTypes.push('lastname');
    this.filterTypes.push('identificationNumber');
    this.filterTypes.push('email');
    this.filterTypes.push('phone');
  }

  reset(clearMsg: boolean) {
    this.loading = false;
    this.allOwnersFetched = false;
    this.invalidMessage = [];
    this.identityInfo = null;
    this.accountName = null;
    if (clearMsg) {
      this.messageService.clearAll();
      this.errorMessage = null;
    }
    this.identityList = null;
  }

  showDetailsFromList(item) {
    const value = new Array<IdentityAttribute>();
    value.push(this.identityList[item]);
    this.getIdentityInfo(value);
  }

  submit() {
    this.messageService.clearError();
    this.validToSubmit = true;
    this.invalidMessage = [];
    this.loading = true;
    this.identityList = null;

    if (this.accountName && this.accountName.trim() != '') {
      const query = new SimpleQueryCondition();
      if (this.selectedFilterTypes !== 'name') {
        query.attribute = 'attributes.' + this.selectedFilterTypes;
      } else {
        query.attribute = this.selectedFilterTypes;
      }

      query.value = this.accountName;

      this.idnService.searchAccounts(query).subscribe(searchResult => {
        //Lets not load the data if we have more than one result
        if (searchResult && searchResult.length > 1) {
          this.messageService.setError(
            `Multiple records found. Click 'Show Details' to select the record.`
          );
          this.identityList = searchResult;
        }

        if (searchResult && searchResult.length == 1) {
          this.getIdentityInfo(searchResult);
        }

        if (searchResult && searchResult.length == 0) {
          this.validToSubmit = false;
          this.messageService.setError(`Record not found.`);
        }
      });
    } else {
      this.messageService.setError('Search value is needed.');
    }

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
    }

    if (identity[0].accessProfileCount) {
      this.identityInfo.accessProfileCount = identity[0].accessProfileCount;
      this.identityInfo.accessProfileNames = identity[0].access
        .filter(each => each.type === 'ACCESS_PROFILE')
        .map(each => each.displayName)
        .join('; ');
    }

    if (identity[0].entitlementCount) {
      this.identityInfo.entitlementCount = identity[0].entitlementCount;
      this.identityInfo.entitlementNames = identity[0].access
        .filter(each => each.type === 'ENTITLEMENT')
        .map(each => each.displayName)
        .join('; ');
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
      }
      if (identity[0].owns.accessProfiles) {
        this.identityInfo.ownAccessProfiles =
          identity[0].owns.accessProfiles.length;
        this.identityInfo.ownAccessProfilesNames =
          identity[0].owns.accessProfiles.map(each => each.name).join('; ');
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
      }
      if (identity[0].owns.governanceGroups) {
        this.identityInfo.ownGovernanceGroups =
          identity[0].owns.governanceGroups.length;
        this.identityInfo.ownGovernanceGroupsNames =
          identity[0].owns.governanceGroups.map(each => each.name).join('; ');
      }
    }

    this.idnService
      .getUserByAlias(this.identityInfo.name)
      .subscribe(userDetail => {
        this.identityInfo.orgPermission = userDetail.role.join('; ');
      });
  }

  getManagerInfo() {
    this.accountName = this.identityInfo.managerAccountName;
    this.selectedFilterTypes = 'name';
    this.submit();
  }

  refreshIdentity() {
    if (this.identityInfo.name && this.identityInfo.name.trim() != '') {
      this.idnService.refreshSingleIdentity(this.identityInfo.name).subscribe(
        () => {
          this.messageService.add(`Triggered Identity Refresh`);
        },
        err => {
          this.messageService.handleIDNError(err);
        }
      );
    }
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
}
