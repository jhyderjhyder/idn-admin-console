import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';
import { Papa } from 'ngx-papaparse';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Source } from '../model/source';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { AuthenticationService } from '../service/authentication-service.service';
import { Role } from '../model/role';
import { SimpleQueryCondition } from '../model/simple-query-condition';
import { SourceOwner } from '../model/source-owner';

@Component({
  selector: 'app-role-management',
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.css']
})
export class RoleManagementComponent implements OnInit {
  sources: Source[];
  bulkAction: string;
  selectAll: boolean;
  atLeastOneSelected: boolean;
  errorInvokeApi: boolean;
  searchText: string;
  loading: boolean;
  invalidMessage: string[];

  allOwnersFetched: boolean;
  roles: Role[];
  rolesToShow: Role[];
  validToSubmit: boolean;
  errorMessage: string;
  deleteRoleConfirmText: string;

  public modalRef: BsModalRef;
  
  @ViewChild('submitConfirmModal', { static: false }) submitConfirmModal: ModalDirective;
  @ViewChild('submitRoleRefreshConfirmModal', { static: false }) submitRoleRefreshConfirmModal: ModalDirective;
  @ViewChild('deleteRoleConfirmModal', { static: false }) deleteRoleConfirmModal: ModalDirective;

  @ViewChild('fileInput', {static: false}) fileInput: ElementRef;

  constructor(private papa: Papa,
    private idnService: IDNService, 
    private messageService: MessageService,
    private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    this.reset(true);
    this.getAllRoles();
  }

  reset(clearMsg: boolean) {
    this.roles = null;
    this.rolesToShow = null;
    this.selectAll = false;
    this.atLeastOneSelected = false;
    this.bulkAction = null;
    this.searchText = null;
    this.loading = false;
    this.invalidMessage = [];
    this.deleteRoleConfirmText = null;
    if (clearMsg) {
      this.messageService.clearAll();
      this.errorInvokeApi = false;
    } 
  }

  getAllRoles() {
    this.allOwnersFetched = false;
    this.loading = true;
    this.idnService.getRoles()
          .subscribe(allRoles => {
            this.roles = [];
            this.rolesToShow = [];
            let roleCount = allRoles.length;
            let fetchedOwnerCount = 0;
            for (let each of allRoles) {
              let role = new Role();
              role.id = each.id;
              role.name = each.name;
              role.description = each.description;
              role.id = each.id;
              role.enabled = each.enabled;
              role.requestable = each.requestable;
              if(each.membership && each.membership.criteria != null) {
                role.criteria = true;
              } else {
                role.criteria = false;
              }
              
              role.accessProfiles = each.accessProfiles.length;
              
              
              let query = new SimpleQueryCondition();
              query.attribute = "id";
              query.value = each.owner.id;

              this.idnService.searchAccounts(query)
                .subscribe(searchResult => { 
                  if (searchResult.length > 0) {
                    role.owner = new SourceOwner();
                    role.owner.accountId = searchResult[0].id;
                    role.owner.accountName = searchResult[0].name;
                    role.owner.displayName = searchResult[0].displayName;
                    role.currentOwnerAccountName = searchResult[0].name;
                    role.currentOwnerDisplayName = searchResult[0].displayName;
                  }
                  fetchedOwnerCount++;
                  if (fetchedOwnerCount == roleCount) {
                    this.allOwnersFetched = true;
                  }
              });
          
              this.roles.push(role);
              this.rolesToShow.push(role);
            }
            this.loading = false;
          });
  }

  resetRolesToShow() {
    this.messageService.clearError();
    if (this.roles) {
      this.rolesToShow = [];
      this.roles.forEach(each => {
        let copy = new Role();
        Object.assign(copy, each);
        this.rolesToShow.push(copy); 
      
      }) ;
    }
  }

  changeOnBulkAction($event) {
    this.resetRolesToShow();
    if ($event && $event != '') {
      this.bulkAction = $event;
      if (this.bulkAction === 'EnableRoles') {
        this.rolesToShow = this.rolesToShow.filter(each => ( !each.enabled ) );
      } else if (this.bulkAction === 'DisableRoles') {
        this.rolesToShow = this.rolesToShow.filter(each => ( each.enabled ) );
      } else if (this.bulkAction === 'MakeRolesRequestable') {
        this.rolesToShow = this.rolesToShow.filter(each => ( !each.requestable ) );
      } else if (this.bulkAction === 'MakeRolesNonRequestable') {
        this.rolesToShow = this.rolesToShow.filter(each => ( each.requestable ) );
      }
    } else {
      this.bulkAction = null;
    }
    this.unselectAll();
  }

  unselectAll() {
    this.selectAll = false;
    this.atLeastOneSelected = false;
    this.rolesToShow.forEach(each => each.selected = false);
  }

  changeOnSelectAll() {
    this.messageService.clearError();
    this.searchText = null;
    this.rolesToShow.forEach(each => each.selected = !this.selectAll);
  }

  changeOnSelect($event) {
    this.messageService.clearError();
    if (!$event.currentTarget.checked) {
      this.selectAll = false;
    }
  }

  showSubmitConfirmModal() {
    this.messageService.clearError();
    this.invalidMessage = [];
    this.atLeastOneSelected = false;
    for (let each of this.rolesToShow) {
      if (each.selected) {
        this.atLeastOneSelected = true;
      }
    }
    this.submitConfirmModal.show();
  }

  hideSubmitConfirmModal() {
    this.submitConfirmModal.hide();
  }

  getSelectedRoles(): Role[] {
    let arr = [];
    for (let each of this.rolesToShow) {
      if (each.selected) {
        arr.push(each);
      }
    }
    return arr;
  }

  closeModalDisplayMsg() {
    if (!this.errorInvokeApi) {
      this.messageService.add("Changes saved successfully.");
    }
    this.submitConfirmModal.hide();
  }

  updateRoles(path: string, enabled: boolean) {
    let arr = this.getSelectedRoles();
    let processedCount = 0;
    for (let each of arr) {
      this.idnService.updateRole(each, path, enabled)
          .subscribe(searchResult => {
            processedCount++;
            if (processedCount == arr.length) {
             this.closeModalDisplayMsg();
             this.reset(false);
             this.getAllRoles();
            }
          },
          err => {
            this.errorInvokeApi = true;
            this.messageService.handleIDNError(err);
            processedCount++;
            if (processedCount == arr.length) {
              this.closeModalDisplayMsg();
              this.reset(false);
              this.getAllRoles();
            }
          }
        );
    }
  } 

  deleteRoles() {
    this.messageService.clearAll();
    this.invalidMessage = [];
    let arr = this.getSelectedRoles();
    let processedCount = 0;
    if (this.deleteRoleConfirmText != "YES TO DELETE") {
      this.invalidMessage.push("Text does not match");
      this.validToSubmit = false;
      return;
    }
    else {
      this.validToSubmit = true;
    }

    for (let each of arr) {
      this.idnService.deleteRole(each)
          .subscribe(searchResult => {
            processedCount++;
            if (processedCount == arr.length) {
            this.messageService.add("Roles deleted successfully.");
            this.deleteRoleConfirmModal.hide();
            this.hideSubmitConfirmModal();
            this.reset(false);
            this.sleep(5000);
            this.getAllRoles();
            }
          },
          err => {
            this.errorInvokeApi = true;
            this.messageService.handleIDNError(err);
            processedCount++;
            if (processedCount == arr.length) {
              this.deleteRoleConfirmModal.hide();
              this.hideSubmitConfirmModal();
              this.messageService.handleIDNError(err);
            }
          }
        );
    }
  } 

  // saveInCsv() {
  //   var options = { 
  //     fieldSeparator: ',',
  //     quoteStrings: '"',
  //     decimalseparator: '.',
  //     showLabels: true,
  //     useHeader: true,
  //     headers: ["name", "description", "type", "cloudExternalID", "accountAggregationScheduled", 
  //       "accountAggregationScheduleCronExp", "entilementAggregationScheduled", "entilementAggregationScheduleCronExp"],
  //     nullToEmptyString: true,
  //   };

  //   const currentUser = this.authenticationService.currentUserValue;
  //   let fileName = `${currentUser.tenant}-Sources`;
  //   let arr = [];
  //   for (let each of this.sources) {
  //     let record = Object.assign(each);
  //     if (each.accountAggregationSchedule) {
  //       record.accountAggregationScheduled = "Yes";
  //       record.accountAggregationScheduleCronExp = each.accountAggregationSchedule.cronExp.toString();
  //     } else {
  //       record.accountAggregationScheduled = "No";
  //     }
  //     if (each.entAggregationSchedule) {
  //       record.entilementAggregationScheduled = "Yes";
  //       record.entilementAggregationScheduleCronExp = each.entAggregationSchedule.cronExp.toString();
  //     } else {
  //       record.entilementAggregationScheduled = "No";
  //     }
  //     arr.push(record);
  //   }

  //   let angularCsv: AngularCsv = new AngularCsv(arr, fileName, options);
  // }

  // clearFileSelect() {
  //   this.messageService.clearError();
  //   this.fileInput.nativeElement.value = "";
  // }

  // handleFileSelect(evt) {
  //   this.messageService.clearError();
  //   let cronExpMap = {}; //key is source cloudExternalID, value is cronExp
  //   var files = evt.target.files; // FileList object
  //   var file = files[0];
  //   var reader = new FileReader();
  //   reader.readAsText(file);
  //   reader.onload = (event: any) => {
  //     var csv = event.target.result; // Content of CSV file
  //     this.papa.parse(csv, {
  //       skipEmptyLines: true,
  //       header: true,
  //       complete: (results) => {
  //         for (let i = 0; i < results.data.length; i++) {
  //           let cloudExternalID = results.data[i].cloudExternalID;
  //           if (this.bulkAction == 'EnableAggSchedule') {
  //             cronExpMap[cloudExternalID] = results.data[i].accountAggregationScheduleCronExp;
  //           } else if (this.bulkAction == 'EnableEntAggSchedule') {
  //             cronExpMap[cloudExternalID] = results.data[i].entilementAggregationScheduleCronExp;
  //           }
  //         }

  //         let anythingMatched = false;

  //         for (let each of this.rolesToShow) {
  //           // if (each.selected) {
  //             let cronExp = cronExpMap[each.cloudExternalID];
  //             if (cronExp && cronExp != '') {
  //               // if (this.bulkAction == 'EnableAggSchedule') {
  //               //   each.accountAggCronExp = cronExp;
  //               // } else if (this.bulkAction == 'EnableEntAggSchedule') {
  //               //   each.entAggCronExp = cronExp;
  //               // }
  //               // anythingMatched = true;
  //             }
  //           // }
  //         }

  //         if (!anythingMatched) {
  //           this.messageService.setError("No source record in uploaded file is matched with the selected items.");
  //         }
  //       }
  //     });
  //   }
  // }

  showRoleRefreshSubmitConfirmModal(){
    this.messageService.clearError();
    this.validToSubmit = true;
    this.submitRoleRefreshConfirmModal.show();
}

hideRoleRefreshSubmitConfirmModal() {
  this.submitRoleRefreshConfirmModal.hide();
}

roleRefresh(){
  this.idnService.refreshAllRoles()
        .subscribe(response => {
          this.closeRoleRefreshModalDisplayMsg();
          this.reset(false);
          this.getAllRoles();
});

}

closeRoleRefreshModalDisplayMsg() {
  if (this.errorMessage != null) {
    this.messageService.setError(this.errorMessage);
  } else {
    this.messageService.add("Org Role Refresh Kicked off. Please check Org -> Admin -> Dashboard -> Monitor");
  }
  this.submitRoleRefreshConfirmModal.hide();
}

hideDeleteRoleConfirmModal() {
  this.deleteRoleConfirmModal.hide();
  this.submitConfirmModal.hide();
}

showDeleteRoleConfirmModal() {
  this.invalidMessage = [];
  this.deleteRoleConfirmText = null;
  this.validToSubmit = false;
  this.deleteRoleConfirmModal.show();
}

sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

}
