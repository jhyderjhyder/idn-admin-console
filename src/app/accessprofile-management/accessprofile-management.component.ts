import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';
import { Papa } from 'ngx-papaparse';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Source } from '../model/source';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { AuthenticationService } from '../service/authentication-service.service';
import { SimpleQueryCondition } from '../model/simple-query-condition';
import { SourceOwner } from '../model/source-owner';
import { AccessProfile } from '../model/accessprofile';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';

const AccessProfileDescriptionMaxLength = 50;

@Component({
  selector: 'app-accessprofile-management',
  templateUrl: './accessprofile-management.component.html',
  styleUrls: ['./accessprofile-management.component.css']
})
export class AccessProfileManagementComponent implements OnInit {
  sources: Source[];
  bulkAction: string;
  selectAll: boolean;
  atLeastOneSelected: boolean;
  errorInvokeApi: boolean;
  searchText: string;
  loading: boolean;
  invalidMessage: string[];

  allOwnersFetched: boolean;
  accessProfiles: AccessProfile[];
  accessProfilesToShow: AccessProfile[];
  validToSubmit: boolean;
  errorMessage: string;
  deleteAccessProfileConfirmText: string;

  zip: JSZip = new JSZip();

  public modalRef: BsModalRef;
  
  @ViewChild('submitConfirmModal', { static: false }) submitConfirmModal: ModalDirective;
  @ViewChild('deleteAccessProfileConfirmModal', { static: false }) deleteAccessProfileConfirmModal: ModalDirective;

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
    this.sources = null;
    this.bulkAction = null;
    this.selectAll = null;
    this.atLeastOneSelected = null;
    this.searchText = null;
    this.loading = false;
    this.invalidMessage = [];
  
    this.allOwnersFetched = false;
    this.accessProfiles = null;
    this.accessProfilesToShow = null;
    this.errorMessage = null;
    this.deleteAccessProfileConfirmText = null;
    if (clearMsg) {
      this.messageService.clearAll();
      this.errorInvokeApi = false;
    } 
  }

  getAllAccessProfiles() {
    this.allOwnersFetched = false;
    this.loading = true;
    this.idnService.getAccessProfiles()
          .subscribe(allAccessProfiles => {
            this.accessProfiles = [];
            this.accessProfilesToShow = [];
            let accessProfileCount = allAccessProfiles.length;
            let fetchedOwnerCount = 0;
            for (let each of allAccessProfiles) {
              let accessProfile = new AccessProfile();
              accessProfile.id = each.id;
              accessProfile.name = each.name;
              if (each.description) {
                if (each.description.length > AccessProfileDescriptionMaxLength) {
                  accessProfile.shortDescription = each.description.substring(0, AccessProfileDescriptionMaxLength) + "...";
                }
                else {
                  accessProfile.description = each.description;
                  accessProfile.shortDescription = each.description;
                }
              }
              accessProfile.id = each.id;
              accessProfile.enabled = each.enabled;
              
              accessProfile.entitlements = each.entitlements.length;

              accessProfile.sourceName = each.source.name;
              
              let entitlementList = [];

              if(each.entitlements != null) {
                for (let entitlement of each.entitlements) {
                  entitlementList.push(entitlement.name);
                }
                accessProfile.entitlementList = entitlementList.join(";").toString();
              }
              
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
                  if (fetchedOwnerCount == accessProfileCount) {
                    this.allOwnersFetched = true;
                  }
              });
          
              this.accessProfiles.push(accessProfile);
              this.accessProfilesToShow.push(accessProfile);
            }
            this.loading = false;
          });
  }

  resetaccessProfilesToShow() {
    this.messageService.clearError();
    if (this.accessProfiles) {
      this.accessProfilesToShow = [];
      this.accessProfiles.forEach(each => {
        let copy = new AccessProfile();
        Object.assign(copy, each);
        this.accessProfilesToShow.push(copy); 
      
      }) ;
    }
  }

  changeOnBulkAction($event) {
    this.resetaccessProfilesToShow();
    if ($event && $event != '') {
      this.bulkAction = $event;
      if (this.bulkAction === 'EnableAccessProfiles') {
        this.accessProfilesToShow = this.accessProfilesToShow.filter(each => ( !each.enabled ) );
      } else if (this.bulkAction === 'DisableAccessProfiles') {
        this.accessProfilesToShow = this.accessProfilesToShow.filter(each => ( each.enabled ) );
      }
    } else {
      this.bulkAction = null;
    }
    this.unselectAll();
  }

  unselectAll() {
    this.selectAll = false;
    this.atLeastOneSelected = false;
    this.accessProfilesToShow.forEach(each => each.selected = false);
  }

  changeOnSelectAll() {
    this.messageService.clearError();
    this.searchText = null;
    this.accessProfilesToShow.forEach(each => each.selected = !this.selectAll);
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
    for (let each of this.accessProfilesToShow) {
      if (each.selected) {
        this.atLeastOneSelected = true;
      }
    }
    this.submitConfirmModal.show();
  }

  hideSubmitConfirmModal() {
    this.submitConfirmModal.hide();
  }

  getSelectedAccessProfiles(): AccessProfile[] {
    let arr = [];
    for (let each of this.accessProfilesToShow) {
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

  updateAccessProfiles(path: string, enabled: boolean) {
    let arr = this.getSelectedAccessProfiles();
    let processedCount = 0;
    for (let each of arr) {
      this.idnService.updateAccessProfile(each, path, enabled)
          .subscribe(searchResult => {
            processedCount++;
            if (processedCount == arr.length) {
             this.closeModalDisplayMsg();
             this.reset(false);
             this.getAllAccessProfiles();
            }
          },
          err => {
            this.errorInvokeApi = true;
            this.messageService.handleIDNError(err);
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

  saveInCsv() {
    var options = { 
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useHeader: true,
      headers: ["name", "description", "id", "enabled", "entitlements", "sourceName", "entitlementList", "ownerAccountID", "ownerDisplayName"],
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

  async deleteAccessProfiles() {
    this.messageService.clearAll();
    this.invalidMessage = [];
    if (this.deleteAccessProfileConfirmText !== "YES TO DELETE") {
      this.invalidMessage.push("Text does not match");
      this.validToSubmit = false;
      return;
    }
    else {
      this.validToSubmit = true;
    }

    let arr = this.getSelectedAccessProfiles();
    let processedCount = 0;
    for (let each of arr) {
      this.idnService.deleteAccessProfile(each)
          .subscribe( async searchResult => {
            processedCount++;
            if (processedCount == arr.length) {
              this.deleteAccessProfileConfirmModal.hide();
              this.messageService.add("Access Profiles deleted successfully.");
              this.hideSubmitConfirmModal();
              this.reset(false);
              await this.sleep(2000);
              this.getAllAccessProfiles();
            }
          },
          err => {
            this.errorInvokeApi = true;
            this.messageService.handleIDNError(err);
            processedCount++;
            if (processedCount == arr.length) {
              this.deleteAccessProfileConfirmModal.hide();
              this.hideSubmitConfirmModal();
              this.messageService.handleIDNError(err);
            }
          }
        );
    }
  } 

hidedeleteAccessProfileConfirmModal() {
  this.deleteAccessProfileConfirmModal.hide();
  this.submitConfirmModal.hide();
}

showdeleteAccessProfileConfirmModal() {
  this.invalidMessage = [];
  this.deleteAccessProfileConfirmText = null;
  this.validToSubmit = false;
  this.deleteAccessProfileConfirmModal.show();
}

async sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

exportAllAccessProfiles() {
    
  this.idnService.getAccessProfiles()
        .subscribe(
          results => {
          this.accessProfiles = [];
          for (let each of results) {
            let accessProfile = new AccessProfile();
            let jsonData = JSON.stringify(each, null, 4);
            accessProfile.name = each.name;
            let fileName = "AccessProfile - " + accessProfile.name + ".json";
            this.zip.file(`${fileName}`, jsonData);
            
          }
          const currentUser = this.authenticationService.currentUserValue;
          let zipFileName = `${currentUser.tenant}-accessprofiles.zip`;

         this.zip.generateAsync({type:"blob"}).then(function(content) {
            saveAs(content, zipFileName);
        });

        this.ngOnInit();

        });    
}

}
