import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';
import { Papa } from 'ngx-papaparse';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { AuthenticationService } from '../service/authentication-service.service';
import { SimpleQueryCondition } from '../model/simple-query-condition';
import { SourceOwner } from '../model/source-owner';
import { AccessProfile } from '../model/accessprofile';

const AccessProfileDescriptionMaxLength = 50;

@Component({
  selector: 'app-accessprofile-owner-update',
  templateUrl: './accessprofile-owner-update.component.html',
  styleUrls: ['./accessprofile-owner-update.component.css']
})
export class ChangeAccessProfileOwnerComponent implements OnInit {
  
  accessProfiles: AccessProfile[];
  loading: boolean;
  allOwnersFetched: boolean;
  searchText: string;
  selectAll: boolean;
  newOwnerAll: string;
  errorMessage: string;
  invalidMessage: string[];
  validToSubmit: boolean;

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
    this.getAllAccessProfiles();
  }

  reset(clearMsg: boolean) {
    this.accessProfiles = null;
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

  getAllAccessProfiles() {
    this.allOwnersFetched = false;
    this.loading = true;
    this.idnService.getAccessProfiles()
          .subscribe(allAccessProfiles => {
            this.accessProfiles = [];
            let apCount = allAccessProfiles.length;
            let fetchedOwnerCount = 0;
            for (let each of allAccessProfiles) {
              let accessProfile = new AccessProfile();
              accessProfile.id = each.id;
              accessProfile.name = each.name;
              if (each.description) {
                if (each.description.length > AccessProfileDescriptionMaxLength) {
                  accessProfile.description = each.description.substring(0, AccessProfileDescriptionMaxLength) + "...";
                }
                else {
                  accessProfile.description = each.description;
                }
              }
              accessProfile.id = each.id;
              accessProfile.enabled = each.enabled;

              accessProfile.entitlements = each.entitlements.length;
              
              let query = new SimpleQueryCondition();
              query.attribute = "id";
              query.value = each.owner.id;

              this.idnService.searchAccounts(query)
                .subscribe(searchResult => { 
                  if (searchResult.length > 0) {
                    accessProfile.owner = new SourceOwner();
                    accessProfile.owner.accountId = searchResult[0].id;
                    accessProfile.owner.accountName = searchResult[0].name;
                    accessProfile.owner.displayName = searchResult[0].displayName;
                    accessProfile.currentOwnerAccountName = searchResult[0].name;
                    accessProfile.currentOwnerDisplayName = searchResult[0].displayName;
                  }
                  fetchedOwnerCount++;
                  if (fetchedOwnerCount == apCount) {
                    this.allOwnersFetched = true;
                  }
              });
          
              this.accessProfiles.push(accessProfile);
            }
            this.loading = false;
          });
  }

  saveInCsv() {
    var options = { 
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useHeader: true,
      headers: ["name", "description", "id", "enabled", "entitlements", "ownerAccountID", "ownerDisplayName"],
      nullToEmptyString: true,
    };

    const currentUser = this.authenticationService.currentUserValue;
    let fileName = `${currentUser.tenant}-accessprofiles`;
    let arr = [];
    for (let each of this.accessProfiles) {
      let record = Object.assign(each);
      if (each.owner) {
        record.ownerAccountID = each.owner.accountName;
        record.ownerDisplayName = each.owner.displayName;
      }
      arr.push(record);
    }

    let angularCsv: AngularCsv = new AngularCsv(arr, fileName, options);
  }

  showSubmitConfirmModal() {
    this.messageService.clearError();
    this.validToSubmit = true;
    let selectedAccessProfiles = [];
    this.invalidMessage = [];
    for (let each of this.accessProfiles) {
      if (each.selected) {
        if (each.newOwner == null || each.newOwner.accountName == null || each.newOwner.accountName.trim() == '') {
          this.invalidMessage.push(`Owner of AccessProfile (name: ${each.name}) can not be empty.`);
          this.validToSubmit = false;
        }
        else if (each.newOwner.accountName == each.owner.accountName) {
          this.invalidMessage.push(`Owner of AccessProfile (name: ${each.name}) is not changed.`);
          this.validToSubmit = false;
        }

        selectedAccessProfiles.push(each);
      }
    }

    if (selectedAccessProfiles.length == 0) {
      this.invalidMessage.push("Select at least one item to submit.");
      this.validToSubmit = false;
    }

    if (this.validToSubmit) {
      let count = 0;
      //check if account name of new owner is valid
      for (let each of selectedAccessProfiles) {
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
              this.invalidMessage.push(`New owner's account name (${each.newOwner.accountName}) of AccessProfile (${each.name}) is invalid.`);
            }
            count++;
            if (count == selectedAccessProfiles.length) {
              this.submitConfirmModal.show();
            }
        });
      }
    } else {
      this.submitConfirmModal.show();
    }
  }

  applyNewOwnerToAllSelected() {
    this.messageService.clearError();
    if (this.newOwnerAll && this.newOwnerAll.trim() != '') {
      let anythingSelected = false;
      for (let each of this.accessProfiles) {
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

  changeOnSelectAll() {
    this.messageService.clearError();
    this.searchText = null;
    this.accessProfiles.forEach(each => {
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
      if (this.accessProfiles[index].newOwner) {
        this.accessProfiles[index].newOwner.accountName = null;
      }
    } else {
      if (this.accessProfiles[index].newOwner == null) {
        this.accessProfiles[index].newOwner = new SourceOwner();
      }
      this.accessProfiles[index].newOwner.accountName = this.accessProfiles[index].owner.accountName;
    }
  }

  clearFileSelect() {
    this.messageService.clearError();
    this.fileInput.nativeElement.value = "";
  }

  hideSubmitConfirmModal() {
    this.submitConfirmModal.hide();
  }

  closeModalDisplayMsg() {
    if (this.errorMessage != null) {
      this.messageService.setError(this.errorMessage);
    } else {
      this.messageService.add("Changes saved successfully.");
    }
    this.submitConfirmModal.hide();
  }

  async updateAccessProfileOwner() {
    let arr = this.accessProfiles.filter(each => each.selected);
    let processedCount = 0;
    let index = 0;
    for (let each of arr) {
      if (index > 0 && (index % 10) == 0) {
        // After processing every batch (10 accessProfiles), wait for 2 seconds before calling another API to avoid 429 
        // Too Many Requests Error
        await this.sleep(2000);
      }
      index++;

      this.idnService.updateAccessProfileOwner(each)
          .subscribe(searchResult => {
            processedCount++;
            if (processedCount == arr.length) {
             this.closeModalDisplayMsg();
             this.reset(false);
             this.getAllAccessProfiles();
            }
          },
          err => {
            this.errorMessage = "Error to submit the changes.";
            processedCount++;
            if (processedCount == arr.length) {
              this.closeModalDisplayMsg();
              this.reset(false);
              this.getAllAccessProfiles();
            }
          }
        );
    }

  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  handleFileSelect(evt) {
    this.messageService.clearError();
    let newOwnerAccountNameMap = {}; //key is accessProfile id, value is new owner account name
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
            let id = results.data[i].id;
            newOwnerAccountNameMap[id] = results.data[i].ownerAccountID;
          }

          let anythingSelected = false;
          let anythingMatched = false;
          
          for (let each of this.accessProfiles) {
            if (each.selected) {
              let newOwnerAccountName = newOwnerAccountNameMap[each.id];
              if (newOwnerAccountName && newOwnerAccountName != '') {
                each.newOwner.accountName = newOwnerAccountName;
                anythingMatched = true;
              }
              anythingSelected = true;
            }
          }
          if (!anythingSelected) {
            this.messageService.setError("No item is selected to apply the change.");
          } else if (!anythingMatched) {
            this.messageService.setError("No accessProfile record in uploaded file is matched with the selected items.");
          }
        }
      });
    }
  }

}
