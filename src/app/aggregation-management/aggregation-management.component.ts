import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';
import { Papa } from 'ngx-papaparse';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Source } from '../model/source';
import { Schedule } from '../model/schedule';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { AuthenticationService } from '../service/authentication-service.service';

@Component({
  selector: 'app-aggregation-management',
  templateUrl: './aggregation-management.component.html',
  styleUrls: ['./aggregation-management.component.css']
})
export class AggregationManagementComponent implements OnInit {
  sources: Source[];
  sourcesToShow: Source[];
  bulkAction: string;
  selectAll: boolean;
  atLeastOneSelected: boolean;
  cronExpSecified: boolean;
  cronExpAll: string;
  errorMessage: string;
  successMessage: string;
  searchText: string;

  public modalRef: BsModalRef;
  
  @ViewChild('submitConfirmModal', { static: false }) submitConfirmModal: ModalDirective;

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
    this.sources = null;
    this.sourcesToShow = null;
    this.selectAll = false;
    this.atLeastOneSelected = false;
    this.cronExpSecified = true;
    this.bulkAction = null;
    this.cronExpAll = null;
    this.searchText = null;
    if (clearMsg) {
      this.errorMessage = null;
      this.successMessage = null;
    } 
  }

  search() {
    this.idnService.searchAggregationSources()
          .subscribe(searchResult => {
            this.sources = [];
            this.sourcesToShow = [];
            let allSources = searchResult.filter(each => (each.type && each.type != 'DelimitedFile'));

            for (let each of allSources) {
              let source = new Source();
              source.id = each.id;
              source.cloudExternalID = each.connectorAttributes.cloudExternalId;
              source.name = each.name;
              source.description = each.description;
              source.type = each.type;

              this.idnService.getAggregationSchedules(source.cloudExternalID)
                .subscribe(searchResult => { 
                  if (searchResult.length > 0) {
                    source.accountAggregationSchedule = new Schedule();
                    source.accountAggregationSchedule.enable = true;
                    source.accountAggregationSchedule.cronExp = searchResult[0].cronExpressions;
                  }
              });
        
              this.idnService.getEntitlementAggregationSchedules(source.cloudExternalID)
                .subscribe(searchResult => { 
                  if (searchResult.length > 0) {
                    source.entAggregationSchedule = new Schedule();
                    source.entAggregationSchedule.enable = true;
                    source.entAggregationSchedule.cronExp = searchResult[0].cronExpressions;
                  }
              });
              
              this.sources.push(source);
              this.sourcesToShow.push(source);
            }
          });
  }

  resetSourcesToShow() {
    if (this.sources) {
      this.sourcesToShow = [];
      this.sources.forEach(each => this.sourcesToShow.push(each));
    }
  }

  changeOnBulkAction($event) {
    this.resetSourcesToShow();
    if ($event && $event != '') {
      this.bulkAction = $event;
      if (this.bulkAction === 'DisableAggSchedule') {
        this.sourcesToShow = this.sourcesToShow.filter(each => ( each.accountAggregationSchedule && each.accountAggregationSchedule.enable) );
      } else if (this.bulkAction === 'DisableEntAggSchedule') {
        this.sourcesToShow = this.sourcesToShow.filter(each => ( each.entAggregationSchedule && each.entAggregationSchedule.enable) );
      } else if (this.bulkAction === 'EnableAggSchedule') {
        this.sourcesToShow = this.sourcesToShow.filter(each => ( each.accountAggregationSchedule == null || !each.accountAggregationSchedule.enable) );
      } else if (this.bulkAction === 'EnableEntAggSchedule') {
        this.sourcesToShow = this.sourcesToShow.filter(each => ( each.entAggregationSchedule == null || !each.entAggregationSchedule.enable) );
      }
    } else {
      this.bulkAction = null;
    }
    this.unselectAll();
  }

  unselectAll() {
    this.selectAll = false;
    this.atLeastOneSelected = false;
    this.sourcesToShow.forEach(each => each.selected = false);
  }

  changeOnSelectAll() {
    this.searchText = null;
    this.sourcesToShow.forEach(each => each.selected = !this.selectAll);
  }

  showSubmitConfirmModal() {
    this.atLeastOneSelected = false;
    this.cronExpSecified = true;
    for (let each of this.sourcesToShow) {
      if (each.selected) {
        this.atLeastOneSelected = true;
        if (this.bulkAction == 'EnableAggSchedule') {
          if (!each.accountAggCronExp || each.accountAggCronExp == '') {
            this.cronExpSecified = false;
          }
        } else if (this.bulkAction == 'EnableEntAggSchedule') {
          if (!each.entAggCronExp || each.entAggCronExp == '') {
            this.cronExpSecified = false;
          }
        }
      }
    }
    this.submitConfirmModal.show();
  }

  hideSubmitConfirmModal() {
    this.submitConfirmModal.hide();
  }

  getSelectedAggSchedules(isEntitlement: boolean, enabled: boolean): Source[] {
    let arr = [];
    for (let each of this.sourcesToShow) {
      if (each.selected) {
        if (!isEntitlement && !enabled && each.accountAggregationSchedule.cronExp.length == 1) {
          each.accountAggCronExp = each.accountAggregationSchedule.cronExp[0];
        } 
        else if (isEntitlement && !enabled && each.entAggregationSchedule.cronExp.length == 1) {
          each.entAggCronExp = each.entAggregationSchedule.cronExp[0];
        } 
        arr.push(each);
      }
    }
    return arr;
  }

  closeModalDisplayMsg() {
    if (this.errorMessage != null) {
      this.messageService.setError(this.errorMessage);
    } else {
      this.messageService.add("Changes saved successfully.");
    }
    this.submitConfirmModal.hide();
  }

  updateAccountAggSchedules(enabled: boolean) {
    let arr = this.getSelectedAggSchedules(false, enabled);
    let processedCount = 0;
    for (let each of arr) {
      this.idnService.updateAggregationSchedules(each, enabled)
          .subscribe(searchResult => {
            processedCount++;
            if (processedCount == arr.length) {
             this.closeModalDisplayMsg();
             this.reset(false);
             this.search();
            }
          },
          err => {
            this.errorMessage = "Error to submit the changes.";
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

  updateEntAggSchedules(enabled: boolean) {
    let arr = this.getSelectedAggSchedules(true, enabled);
    let processedCount = 0;
    for (let each of arr) {
      this.idnService.updateEntAggregationSchedules(each, enabled)
          .subscribe(searchResult => {
            processedCount++;
            if (processedCount == arr.length) {
             this.closeModalDisplayMsg();
             this.reset(false);
             this.search();
            }
          },
          err => {
            this.errorMessage = "Error to submit the changes.";
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
    // if (this.cronExpAll && this.cronExpAll != null) {
      for (let each of this.sourcesToShow) {
        if (each.selected) {
          if (this.bulkAction == 'EnableAggSchedule') {
            each.accountAggCronExp = this.cronExpAll;
          } else if (this.bulkAction == 'EnableEntAggSchedule') {
            each.entAggCronExp = this.cronExpAll;
          }
        }
      }
    // }
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

  handleFileSelect(evt) {
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

          for (let each of this.sourcesToShow) {
            if (each.selected) {
              let cronExp = cronExpMap[each.cloudExternalID];
              if (cronExp && cronExp != '') {
                if (this.bulkAction == 'EnableAggSchedule') {
                  each.accountAggCronExp = cronExp;
                } else if (this.bulkAction == 'EnableEntAggSchedule') {
                  each.entAggCronExp = cronExp;
                }
              }
            }
          }
        }
      });
    }
  }

}
