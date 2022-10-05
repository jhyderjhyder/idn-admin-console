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

@Component({
  selector: 'app-source-aggregation-management',
  templateUrl: './source-aggregation-management.component.html',
  styleUrls: ['./source-aggregation-management.component.css']
})
export class AggregationManagementComponent implements OnInit {
  sources: Source[];
  sourcesToShow: Source[];
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
    this.sources = null;
    this.sourcesToShow = null;
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
    this.accntAggScheduleLoaded = false;
    this.entAggScheduleLoaded = false;
    this.loading = true;
    this.idnService.searchAggregationSources()
          .subscribe(searchResult => {
            this.sources = [];
            this.sourcesToShow = [];
            let allSources = searchResult.filter(each => (each.type && each.type != 'DelimitedFile'));
            let count = allSources.length;
            let fetchAccntAggScheduleCount = 0;
            let fetchEntAggScheduleCount = 0;

            for (let each of allSources) {
              let source = new Source();
              source.id = each.id;
              source.cloudExternalID = each.connectorAttributes.cloudExternalId;
              source.name = each.name;
              source.description = each.description;
              source.type = each.type;

              this.idnService.getAggregationSchedules(source.cloudExternalID)
                .subscribe(
                  searchResult => {
                    if (searchResult.length > 0) {
                      source.accountAggregationSchedule = new Schedule();
                      source.accountAggregationSchedule.enable = true;
                      source.accountAggregationSchedule.cronExp = searchResult[0].cronExpressions;
                    }
                    fetchAccntAggScheduleCount++;
                    if (fetchAccntAggScheduleCount == count) {
                      this.accntAggScheduleLoaded = true;
                    }
                  },
                  err => {
                    // this.messageService.addError(`Error to retrieve Aggregation Schedule for Source (${source.name})`);
                    this.messageService.handleIDNError(err);
                    fetchAccntAggScheduleCount++;
                    if (fetchAccntAggScheduleCount == count) {
                      this.accntAggScheduleLoaded = true;
                    }
                  }
              );
        
              this.idnService.getEntitlementAggregationSchedules(source.cloudExternalID)
                .subscribe(
                  searchResult => {
                    if (searchResult.length > 0) {
                      source.entAggregationSchedule = new Schedule();
                      source.entAggregationSchedule.enable = true;
                      source.entAggregationSchedule.cronExp = searchResult[0].cronExpressions;
                    }
                    fetchEntAggScheduleCount++;
                    if (fetchEntAggScheduleCount == count) {
                      this.entAggScheduleLoaded = true;
                    }
                  },
                  err => {
                    // this.messageService.addError(`Error to retrieve Entitlement Aggregation Schedule for Source (${source.name})`);
                    this.messageService.handleIDNError(err);
                    fetchEntAggScheduleCount++;
                    if (fetchEntAggScheduleCount == count) {
                      this.entAggScheduleLoaded = true;
                    }
                  }
              
              );
              
              this.sources.push(source);
              this.sourcesToShow.push(source);
            }
            this.loading = false;
          });
  }

  resetSourcesToShow() {
    this.messageService.clearError();
    this.cronExpAll = null;
    if (this.sources) {
      this.sourcesToShow = [];
      this.sources.forEach(each => {
        let copy = new Source();
        Object.assign(copy, each);
        this.sourcesToShow.push(copy); 
      
      }) ;
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
    this.messageService.clearError();
    this.searchText = null;
    this.sourcesToShow.forEach(each => each.selected = !this.selectAll);
  }

  changeOnSelect($event) {
    this.messageService.clearError();
    if (!$event.currentTarget.checked) {
      this.selectAll = false;
    }
  }

  validateCronExp(cronExp: string, sourceName: string) :boolean {
    const cronResult = cron(cronExp, {
        override: {
          useSeconds: true,
          useBlankDay: true,
        },
      }
    );
    if (!cronResult.isValid()) {
      this.invalidMessage.push(`Invalid Cron Job Expression (${cronExp}) of the selected source (name: ${sourceName}).`);
      return false;
    } else {
      return true;
    }
  }

  showSubmitConfirmModal() {
    this.messageService.clearError();
    this.invalidMessage = [];
    this.atLeastOneSelected = false;
    this.cronExpValid = true;
    for (let each of this.sourcesToShow) {
      if (each.selected) {
        this.atLeastOneSelected = true;
        if (this.bulkAction == 'EnableAggSchedule') {
          if (!each.accountAggCronExp || each.accountAggCronExp.trim() == '') {
            this.invalidMessage.push(`Enter Cron Job Expression of the selected source (name: ${each.name}).`);
            this.cronExpValid = false;
          } else {
            if (!this.validateCronExp(each.accountAggCronExp, each.name)) {
              this.cronExpValid = false;
            }
          }
        } else if (this.bulkAction == 'EnableEntAggSchedule') {
          if (!each.entAggCronExp || each.entAggCronExp.trim() == '') {
            this.invalidMessage.push(`Enter Cron Job Expression of the selected source (name: ${each.name}).`);
            this.cronExpValid = false;
          } else {
            if (!this.validateCronExp(each.entAggCronExp, each.name)) {
              this.cronExpValid = false;
            }
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
    if (!this.errorInvokeApi) {
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
      for (let each of this.sourcesToShow) {
        if (each.selected) {
          if (this.bulkAction == 'EnableAggSchedule') {
            each.accountAggCronExp = this.cronExpAll;
          } else if (this.bulkAction == 'EnableEntAggSchedule') {
            each.entAggCronExp = this.cronExpAll;
          }
          anythingSelected = true;
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
    let fileName = `${currentUser.tenant}-sources`;
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

          for (let each of this.sourcesToShow) {
            // if (each.selected) {
              let cronExp = cronExpMap[each.cloudExternalID];
              if (cronExp && cronExp != '') {
                if (this.bulkAction == 'EnableAggSchedule') {
                  each.accountAggCronExp = cronExp;
                } else if (this.bulkAction == 'EnableEntAggSchedule') {
                  each.entAggCronExp = cronExp;
                }
                anythingMatched = true;
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
