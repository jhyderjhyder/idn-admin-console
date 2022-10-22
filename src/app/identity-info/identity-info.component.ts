import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Papa } from 'ngx-papaparse';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { SimpleQueryCondition } from '../model/simple-query-condition';
import { IdentityAttribute } from '../model/identity-attribute';

@Component({
  selector: 'app-identity-info',
  templateUrl: './identity-info.component.html',
  styleUrls: ['./identity-info.component.css']
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
  
  constructor(private papa: Papa,
    private idnService: IDNService, 
    private messageService: MessageService) {
  }

  ngOnInit() {

    this.reset(true);

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
  }

  getIdentityInfo(identity){

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
    this.identityInfo.cloudLifecycleState = identity[0].attributes.cloudLifecycleState;
    this.identityInfo.cloudStatus = identity[0].attributes.cloudStatus;
    this.identityInfo.identityProfile = identity[0].identityProfile.name;

    this.identityInfo.accountCount = identity[0].accountCount;
    this.identityInfo.appCount = identity[0].appCount;
    this.identityInfo.accessCount = identity[0].accessCount;
    this.identityInfo.roleCount = identity[0].roleCount;
    this.identityInfo.entitlementCount = identity[0].entitlementCount;
    this.identityInfo.tagsCount = identity[0].tagsCount;

    if (identity[0].owns) {
      if (identity[0].owns.sources) {
        this.identityInfo.ownSources = identity[0].owns.sources.length;
      }
      if (identity[0].owns.accessProfiles) {
        this.identityInfo.ownAccessProfiles = identity[0].owns.accessProfiles.length;
      }
      if (identity[0].owns.apps) {
        this.identityInfo.ownApps = identity[0].owns.apps.length;
      }
      if (identity[0].owns.roles) {
        this.identityInfo.ownRoles = identity[0].owns.roles.length;
      }
      if (identity[0].owns.governanceGroups) {
        this.identityInfo.ownGovernanceGroups = identity[0].owns.governanceGroups.length;
      }
    }

    this.idnService.getUserByAlias(this.accountName)
    .subscribe( userDetail => {
      this.identityInfo.orgPermission = userDetail.role;
    })
    
  }

  getManagerInfo(){

    this.accountName = this.identityInfo.managerAccountName;
    this.submit();

  }

  submit() {
    this.messageService.clearError();
    this.validToSubmit = true;
    this.invalidMessage = [];
    this.loading = true;

    if (this.accountName && this.accountName.trim() != '') {

      let query = new SimpleQueryCondition();
      query.attribute = "name";
      query.value = this.accountName;

      this.idnService.searchAccounts(query)
      .subscribe(searchResult => { 
        if (searchResult && searchResult.length == 1) {
          this.getIdentityInfo(searchResult);
         
        } else {
          this.validToSubmit = false;
          this.messageService.setError(`Identity Account Name is Invalid.`);
        }
       
    });

    } else {
      this.messageService.setError("Identity Account Name is needed.");
    }

    this.loading = false;

  }

}
