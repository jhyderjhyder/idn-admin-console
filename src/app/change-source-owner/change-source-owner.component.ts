import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';
import { Papa } from 'ngx-papaparse';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Source } from '../model/source';
import { SimpleQueryCondition } from '../model/simple-query-condition';
import { SourceOwner } from '../model/source-owner';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { AuthenticationService } from '../service/authentication-service.service';

@Component({
  selector: 'app-change-source-owner',
  templateUrl: './change-source-owner.component.html',
  styleUrls: ['./change-source-owner.component.css']
})
export class ChangeSourceOwnerComponent implements OnInit {
  sources: Source[];
  selectAll: boolean;
  newOwnerAll: string;
  validToSubmit: boolean;
  invalidMessage: string[];
  errorMessage: string;
  searchText: string;
  allOwnersFetched: boolean;
  loading: boolean;

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
    this.selectAll = false;
    this.newOwnerAll = null;
    this.searchText = null;
    this.loading = false;
    this.allOwnersFetched = false;
    this.invalidMessage = [];
    if (clearMsg) {
      this.messageService.clearAll();
      this.errorMessage = null;
    } 
  }

  search() {
    this.allOwnersFetched = false;
    this.loading = true;
    this.idnService.searchAggregationSources()
          .subscribe(allSources => {
            this.sources = [];
            let sourceCount = allSources.length;
            let fetchedOwnerCount = 0;
            for (let each of allSources) {
              let source = new Source();
              source.id = each.id;
              source.cloudExternalID = each.connectorAttributes.cloudExternalId;
              source.name = each.name;
              source.description = each.description;
              source.type = each.type;
              
              let query = new SimpleQueryCondition();
              query.attribute = "id";
              query.value = each.owner.id;

              this.idnService.searchAccounts(query)
                .subscribe(searchResult => { 
                  if (searchResult.length > 0) {
                    source.owner = new SourceOwner();
                    source.owner.accountId = searchResult[0].id;
                    source.owner.accountName = searchResult[0].name;
                    source.owner.displayName = searchResult[0].displayName;
                  }
                  fetchedOwnerCount++;
                  if (fetchedOwnerCount == sourceCount) {
                    this.allOwnersFetched = true;
                  }
              });
          
              this.sources.push(source);
            }
            this.loading = false;
          });
  }

  changeOnSelectAll() {
    this.messageService.clearError();
    this.searchText = null;
    this.sources.forEach(each => {
      each.selected = !this.selectAll;
      if (each.selected) {
        if (each.newOwner == null) {
          each.newOwner = new SourceOwner();
        }
        each.newOwner.accountName = each.owner.accountName;
      } else {
        if (each.newOwner) {
          each.newOwner.accountName = null;
        }
      }
    });
  }

  changeOnSelect($event, index: number) {
    this.messageService.clearError();
    if (!$event.currentTarget.checked) {
      this.selectAll = false;
      if (this.sources[index].newOwner) {
        this.sources[index].newOwner.accountName = null;
      }
    } else {
      if (this.sources[index].newOwner == null) {
        this.sources[index].newOwner = new SourceOwner();
      }
      this.sources[index].newOwner.accountName = this.sources[index].owner.accountName;
    }
  }

  applyNewOwnerToAllSelected() {
    this.messageService.clearError();
    if (this.newOwnerAll && this.newOwnerAll.trim() != '') {
      let anythingSelected = false;
      for (let each of this.sources) {
        if (each.selected) {
          if (each.newOwner == null) {
            each.newOwner = new SourceOwner();
          }
          each.newOwner.accountName = this.newOwnerAll;
          anythingSelected = true;
        }
      }
      if (!anythingSelected) {
        this.messageService.setError("No item is selected to apply the new owner account name.");
      }
    } else {
      this.messageService.setError("Owner account name is required to apply to the selected items.");
    }
  }

  showSubmitConfirmModal() {
    this.messageService.clearError();
    this.validToSubmit = true;
    let selectedSources = [];
    this.invalidMessage = [];
    for (let each of this.sources) {
      if (each.selected) {
        if (each.newOwner == null || each.newOwner.accountName == null || each.newOwner.accountName.trim() == '') {
          this.invalidMessage.push(`Owner of Source (name: ${each.name}) can not be empty.`);
          this.validToSubmit = false;
        }
        else if (each.newOwner.accountName == each.owner.accountName) {
          this.invalidMessage.push(`Owner of Source (name: ${each.name}) is not changed.`);
          this.validToSubmit = false;
        }

        selectedSources.push(each);
      }
    }

    if (selectedSources.length == 0) {
      this.invalidMessage.push("Select at least one item to submit.");
      this.validToSubmit = false;
    }

    if (this.validToSubmit) {
      let count = 0;
      //check if account name of new owner is valid
      for (let each of selectedSources) {
        let query = new SimpleQueryCondition();
        query.attribute = "name";
        query.value = each.newOwner.accountName;

        this.idnService.searchAccounts(query)
          .subscribe(searchResult => { 
            if (searchResult && searchResult.length == 1) {
              each.newOwner.accountId = searchResult[0].id;
              each.newOwner.displayName = searchResult[0].displayName;
            } else {
              this.validToSubmit = false;
              this.invalidMessage.push(`New owner's account name (${each.newOwner.accountName}) of Source (${each.name}) is invalid.`);
            }
            count++;
            if (count == selectedSources.length) {
              this.submitConfirmModal.show();
            }
        });
      }
    } else {
      this.submitConfirmModal.show();
    }
  }

  hideSubmitConfirmModal() {
    this.submitConfirmModal.hide();
  }

  getSelectedAggSchedules(isEntitlement: boolean, enabled: boolean): Source[] {
    let arr = [];
    for (let each of this.sources) {
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

  updateSourceOwner() {
    let arr = this.sources.filter(each => each.selected);
    let processedCount = 0;
    for (let each of arr) {
      this.idnService.updateSourceOwner(each)
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

  saveInCsv() {
    var options = { 
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useHeader: true,
      headers: ["name", "description", "type", "cloudExternalID", "ownerAccountName", "ownerDisplayName"],
      nullToEmptyString: true,
    };

    const currentUser = this.authenticationService.currentUserValue;
    let fileName = `${currentUser.tenant}-Source-Owners`;
    let arr = [];
    for (let each of this.sources) {
      let record = Object.assign(each);
      if (each.owner) {
        record.ownerAccountName = each.owner.accountName;
        record.ownerDisplayName = each.owner.displayName;
      }
      arr.push(record);
    }

    let angularCsv: AngularCsv = new AngularCsv(arr, fileName, options);
  }

}
