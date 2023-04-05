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
  //Pages
  xTotalCount: number;
  offset:number;
  limit:number;
  hasMorePages:boolean;



  constructor(
    private idnService: IDNService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService
  ) {}

  
  ngOnInit() {
    this.hasMorePages=true;
    this.offset=0;
    this.limit=10;
    this.selectedFilterTypes= "name";
    this.filterTypes = Array<string>();
    this.initFilterTypes();
    this.reset(true);
   
  }

  initFilterTypes(){
    this.filterTypes.push("name");
    this.filterTypes.push("email");
    this.filterTypes.push("phone");
    this.filterTypes.push("lastName");
    this.filterTypes.push("firstName");
    /*
    This is optional but you can pass a set of attributes
    you want to search on like departement.  This will
    be a simple method that you can test any search
    options you need.  
    */
    let attributues = process.env.NG_APP_IDENTITY_SEARCH
    if (attributues){
      const split = attributues.split(",");
      var i = 0;
      while (split.length > i){
        this.filterTypes.push("attributes." + split[i]);
        i++;
      }
      
    }
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
    this.identityList=null;
  }

  /*
  If we get more than one user from the API
  when you click the show details button
  it will show just that users details
  */
  showDetailsFromList(item) {
    let value = new Array<IdentityAttribute>;
    value.push(this.identityList[item]);
    this.identityList=null;
    this.messageService.clearAll();
    this.getIdentityInfo(value);
  }

  getNextPage(){
    this.offset++;
    this.submit();
    if (this.xTotalCount/this.limit>this.offset){
      this.hasMorePages=false;
    }
  }

  submit() {
    this.messageService.clearError();
    this.validToSubmit = true;
    this.invalidMessage = [];
    this.loading = true;

    if (this.accountName && this.accountName.trim() != '') {
      const query = new SimpleQueryCondition();
      query.attribute = this.selectedFilterTypes;
      query.value = this.accountName;

      this.idnService.searchAccountsPaged(query,this.limit, this.offset).subscribe(response => {
        let searchResult = response.body;
        let headers = response.headers;
        this.xTotalCount = headers.get("X-Total-Count");
        console.table(searchResult);
        //Lets not load the data if we have more than one result
        
        if (searchResult && searchResult.length > 1){
          this.messageService.setError(`Not Distinct.`);
          //xTotalCount
          this.identityList = searchResult;
        }

        if (searchResult && searchResult.length == 1) {
          this.getIdentityInfo(searchResult);
        } 

        if((searchResult && searchResult.length ==0)) {
          this.validToSubmit = false;
          this.messageService.setError(`Identity Account Name is Invalid.`);
        }
      });
    } else {
      this.messageService.setError('Identity Account Name is needed.');
    }

    this.loading = false;
  }

  getIdentityInfo(identity) {
    this.identityInfo = new IdentityAttribute();

    this.identityInfo.id = identity[0].id;
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

    this.idnService.getUserByAlias(this.accountName).subscribe(userDetail => {
      this.identityInfo.orgPermission = userDetail.role.join('; ');
    });
  }

  getManagerInfo() {
    this.accountName = this.identityInfo.managerAccountName;
    this.selectedFilterTypes="name";
    this.submit();
  }

  refreshIdentity() {
    if (this.accountName && this.accountName.trim() != '') {
      this.idnService.refreshSingleIdentity(this.accountName).subscribe(
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
    const fileName = `${currentUser.tenant}-${this.accountName}-identity-info`;

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
