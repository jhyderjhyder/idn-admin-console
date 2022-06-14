import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';
import { Papa } from 'ngx-papaparse';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import cron from 'cron-validate'
import { Source } from '../model/source';
import { Schedule } from '../model/schedule';
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
  cronExpValid: boolean;
  cronExpAll: string;
  errorInvokeApi: boolean;
  searchText: string;
  accntAggScheduleLoaded: boolean;
  entAggScheduleLoaded: boolean;
  loading: boolean;
  invalidMessage: string[];

  allOwnersFetched: boolean;
  roles: Role[];
  rolesToShow: Role[];

  public modalRef: BsModalRef;
  
  @ViewChild('submitConfirmModal', { static: false }) submitConfirmModal: ModalDirective;

  @ViewChild('fileInput', {static: false}) fileInput: ElementRef;

  constructor(private papa: Papa,
    private idnService: IDNService, 
    private messageService: MessageService,
    private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    this.reset(true);
    this.search();
  }

  reset(clearMsg: boolean) {
    this.roles = null;
    this.rolesToShow = null;
    this.selectAll = false;
    this.atLeastOneSelected = false;
    this.cronExpValid = true;
    this.bulkAction = null;
    this.cronExpAll = null;
    this.searchText = null;
    this.loading = false;
    this.invalidMessage = [];
    if (clearMsg) {
      this.messageService.clearAll();
      this.errorInvokeApi = false;
    } 
  }

  search() {
    this.allOwnersFetched = false;
    this.loading = true;
    this.idnService.getAllRoles()
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

  resetrolesToShow() {
    this.messageService.clearError();
    this.cronExpAll = null;
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
    this.resetrolesToShow();
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
        if (this.bulkAction == 'EnableRoles') {
          // if (!each.accountAggCronExp || each.accountAggCronExp.trim() == '') {
          //   this.invalidMessage.push(`Enter Cron Job Expression of the selected source (name: ${each.name}).`);
          //   this.cronExpValid = false;
          // } else {
          //   if (!this.validateCronExp(each.accountAggCronExp, each.name)) {
          //     this.cronExpValid = false;
          //   }
          // }
        } else if (this.bulkAction == 'DisableRoles') {
          // if (!each.entAggCronExp || each.entAggCronExp.trim() == '') {
          //   this.invalidMessage.push(`Enter Cron Job Expression of the selected source (name: ${each.name}).`);
          //   this.cronExpValid = false;
          // } else {
          //   if (!this.validateCronExp(each.entAggCronExp, each.name)) {
          //     this.cronExpValid = false;
          //   }
          // }
        } else if (this.bulkAction == 'MakeRolesRequestable') {
          // if (!each.entAggCronExp || each.entAggCronExp.trim() == '') {
          //   this.invalidMessage.push(`Enter Cron Job Expression of the selected source (name: ${each.name}).`);
          //   this.cronExpValid = false;
          // } else {
          //   if (!this.validateCronExp(each.entAggCronExp, each.name)) {
          //     this.cronExpValid = false;
          //   }
          // }
        } else if (this.bulkAction == 'MakeRolesNonRequestable') {
          // if (!each.entAggCronExp || each.entAggCronExp.trim() == '') {
          //   this.invalidMessage.push(`Enter Cron Job Expression of the selected source (name: ${each.name}).`);
          //   this.cronExpValid = false;
          // } else {
          //   if (!this.validateCronExp(each.entAggCronExp, each.name)) {
          //     this.cronExpValid = false;
          //   }
          // }
        } else if (this.bulkAction == 'DeleteRoles') {
          // if (!each.entAggCronExp || each.entAggCronExp.trim() == '') {
          //   this.invalidMessage.push(`Enter Cron Job Expression of the selected source (name: ${each.name}).`);
          //   this.cronExpValid = false;
          // } else {
          //   if (!this.validateCronExp(each.entAggCronExp, each.name)) {
          //     this.cronExpValid = false;
          //   }
          // }
        }
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
             this.search();
            }
          },
          err => {
            this.errorInvokeApi = true;
            this.messageService.handleIDNError(err);
            processedCount++;
            if (processedCount == arr.length) {
              this.closeModalDisplayMsg();
              this.reset(false);
              this.search();
            }
          }
        );
    }
  } 

  deleteRoles() {
    let arr = this.getSelectedRoles();
    let processedCount = 0;
    for (let each of arr) {
      this.idnService.deleteRole(each)
          .subscribe(searchResult => {
            processedCount++;
            if (processedCount == arr.length) {
             this.closeModalDisplayMsg();
             this.reset(true);
             this.search();
            }
          },
          err => {
            this.errorInvokeApi = true;
            this.messageService.handleIDNError(err);
            processedCount++;
            if (processedCount == arr.length) {
              this.closeModalDisplayMsg();
              this.reset(false);
              this.search();
            }
          }
        );
    }
  } 

  applyCronExpToAll() {
    this.messageService.clearError();
    if (this.cronExpAll && this.cronExpAll != null) {
      let anythingSelected = false;
      for (let each of this.rolesToShow) {
        if (each.selected) {
          // if (this.bulkAction == 'EnableAggSchedule') {
          //   each.accountAggCronExp = this.cronExpAll;
          // } else if (this.bulkAction == 'EnableEntAggSchedule') {
          //   each.entAggCronExp = this.cronExpAll;
          // }
          // anythingSelected = true;
        }
      }
      if (!anythingSelected) {
        this.messageService.setError("No item is selected to apply the Cron Job Expression.");
      }
    } else {
      this.messageService.setError("Enter Cron Job Expression to apply to the selected items.");
    }
  }

  saveInCsv() {
    var options = { 
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useHeader: true,
      headers: ["name", "description", "type", "cloudExternalID", "accountAggregationScheduled", 
        "accountAggregationScheduleCronExp", "entilementAggregationScheduled", "entilementAggregationScheduleCronExp"],
      nullToEmptyString: true,
    };

    const currentUser = this.authenticationService.currentUserValue;
    let fileName = `${currentUser.tenant}-Sources`;
    let arr = [];
    for (let each of this.sources) {
      let record = Object.assign(each);
      if (each.accountAggregationSchedule) {
        record.accountAggregationScheduled = "Yes";
        record.accountAggregationScheduleCronExp = each.accountAggregationSchedule.cronExp.toString();
      } else {
        record.accountAggregationScheduled = "No";
      }
      if (each.entAggregationSchedule) {
        record.entilementAggregationScheduled = "Yes";
        record.entilementAggregationScheduleCronExp = each.entAggregationSchedule.cronExp.toString();
      } else {
        record.entilementAggregationScheduled = "No";
      }
      arr.push(record);
    }

    let angularCsv: AngularCsv = new AngularCsv(arr, fileName, options);
  }

  clearFileSelect() {
    this.messageService.clearError();
    this.fileInput.nativeElement.value = "";
  }

  handleFileSelect(evt) {
    this.messageService.clearError();
    let cronExpMap = {}; //key is source cloudExternalID, value is cronExp
    var files = evt.target.files; // FileList object
    var file = files[0];
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (event: any) => {
      var csv = event.target.result; // Content of CSV file
      this.papa.parse(csv, {
        skipEmptyLines: true,
        header: true,
        complete: (results) => {
          for (let i = 0; i < results.data.length; i++) {
            let cloudExternalID = results.data[i].cloudExternalID;
            if (this.bulkAction == 'EnableAggSchedule') {
              cronExpMap[cloudExternalID] = results.data[i].accountAggregationScheduleCronExp;
            } else if (this.bulkAction == 'EnableEntAggSchedule') {
              cronExpMap[cloudExternalID] = results.data[i].entilementAggregationScheduleCronExp;
            }
          }

          let anythingMatched = false;

          for (let each of this.rolesToShow) {
            // if (each.selected) {
              let cronExp = cronExpMap[each.cloudExternalID];
              if (cronExp && cronExp != '') {
                // if (this.bulkAction == 'EnableAggSchedule') {
                //   each.accountAggCronExp = cronExp;
                // } else if (this.bulkAction == 'EnableEntAggSchedule') {
                //   each.entAggCronExp = cronExp;
                // }
                // anythingMatched = true;
              }
            // }
          }

          if (!anythingMatched) {
            this.messageService.setError("No source record in uploaded file is matched with the selected items.");
          }
        }
      });
    }
  }

}
