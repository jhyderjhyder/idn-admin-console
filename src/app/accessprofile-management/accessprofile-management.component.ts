import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';
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
  styleUrls: ['./accessprofile-management.component.css'],
})
export class AccessProfileManagementComponent implements OnInit {
  private isNavigating = false;
  private abortController = new AbortController();

  sources: Source[];
  bulkAction: string;
  selectAll: boolean;
  atLeastOneSelected: boolean;
  errorInvokeApi: boolean;
  searchText: string;
  loading: boolean;
  invalidMessage: string[];
  accessProfileCount: number;
  exporting: boolean;
  totalEnabled: number;
  totalDisabled: number;
  defaultLimit = 50; //default limit for Access Profiles API is 50
  retryDelay = 3000; //retry delay for 3 seconds
  maxRetries = 5; // Number of times to retry
  allAPData: any;
  loadedCount: number;

  allOwnersFetched: boolean;
  accessProfiles: AccessProfile[];
  accessProfilesToShow: AccessProfile[];
  validToSubmit: boolean;
  errorMessage: string;
  deleteAccessProfileConfirmText: string;

  zip: JSZip = new JSZip();

  public modalRef: BsModalRef;

  @ViewChild('submitConfirmModal', { static: false })
  submitConfirmModal: ModalDirective;
  @ViewChild('deleteAccessProfileConfirmModal', { static: false })
  deleteAccessProfileConfirmModal: ModalDirective;

  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  constructor(
    private idnService: IDNService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit() {
    this.reset(true);
    this.getAllAccessProfiles();
  }

  public ngOnDestroy() {
    this.isNavigating = true;
    this.abortController.abort();
    this.allAPData = null;
    this.accessProfiles = [];
    this.accessProfilesToShow = [];
  }

  reset(clearMsg: boolean) {
    this.sources = null;
    this.bulkAction = null;
    this.selectAll = null;
    this.atLeastOneSelected = null;
    this.searchText = null;
    this.loading = false;
    this.exporting = false;
    this.invalidMessage = [];
    this.accessProfileCount = null;
    this.totalEnabled = null;
    this.totalDisabled = null;
    this.loadedCount = null;
    this.allAPData = null;

    this.allOwnersFetched = false;
    this.accessProfiles = [];
    this.accessProfilesToShow = [];
    this.errorMessage = null;
    this.deleteAccessProfileConfirmText = null;
    if (clearMsg) {
      this.messageService.clearAll();
      this.errorInvokeApi = false;
    }
  }

  async getAllAccessProfiles() {
    this.allOwnersFetched = false;
    this.loading = true;
    this.accessProfileCount = 0;
    this.totalEnabled = 0;
    this.accessProfiles = [];
    this.accessProfilesToShow = [];
    let fetchedOwnerCount = 0;

    try {
      const data = await this.getAllAccessProfilesData();
      this.accessProfileCount = data.length;
      this.totalEnabled = data.filter(each => each.enabled).length;
      this.totalDisabled = data.filter(each => !each.enabled).length;

      //Sort it alphabetically
      data.sort((a, b) => a.name.localeCompare(b.name));
      this.allAPData = data;
      let index = 0;
      for (const each of data) {
        if (index > 0 && index % 10 == 0) {
          // After processing every batch (10 roles), wait for 1 seconds before calling another API to avoid 429
          // Too Many Requests Error
          await this.sleep(1000);
        }
        index++;

        const accessProfile = new AccessProfile();
        accessProfile.id = each.id;
        accessProfile.name = each.name;
        if (each.description) {
          if (each.description.length > AccessProfileDescriptionMaxLength) {
            accessProfile.shortDescription =
              each.description.substring(0, AccessProfileDescriptionMaxLength) +
              '...';
          } else {
            accessProfile.description = each.description;
            accessProfile.shortDescription = each.description;
          }
        }
        accessProfile.id = each.id;
        accessProfile.enabled = each.enabled;

        accessProfile.entitlements = each.entitlements.length;

        accessProfile.sourceName = each.source.name;

        const entitlementList = [];

        if (each.entitlements != null) {
          for (const entitlement of each.entitlements) {
            entitlementList.push(entitlement.name);
          }
          accessProfile.entitlementList = entitlementList.join(';').toString();
        }

        if (!this.isNavigating) {
          const query = new SimpleQueryCondition();
          query.attribute = 'id';
          query.value = each.owner.id;

          const searchResult = await this.idnService
            .searchAccounts(query)
            .toPromise();
          if (searchResult.length > 0) {
            accessProfile.owner = new SourceOwner();
            accessProfile.owner.accountId = searchResult[0].id;
            accessProfile.owner.accountName = searchResult[0].name;
            accessProfile.owner.displayName = searchResult[0].displayName;
            accessProfile.currentOwnerAccountName = searchResult[0].name;
            accessProfile.currentOwnerDisplayName = searchResult[0].displayName;
          }
          fetchedOwnerCount++;
          if (fetchedOwnerCount == this.accessProfileCount) {
            this.allOwnersFetched = true;
          }
        }

        this.accessProfiles.push(accessProfile);
        this.accessProfilesToShow.push(accessProfile);
        this.loadedCount = this.accessProfiles.length;
      }
    } catch (error) {
      console.error(error);
    }
    this.loading = false;
  }

  public async getAllAccessProfilesData(): Promise<any> {
    const count = await this.idnService
      .getTotalAccessProfilesCount()
      .toPromise();
    const allData: AccessProfile[] = [];

    for (
      let offset = 0;
      allData.length < count && !this.isNavigating;
      offset += this.defaultLimit
    ) {
      const dataPage = await this.idnService
        .getAllAccessProfiles(offset, this.defaultLimit, {
          signal: this.abortController.signal,
        })
        .toPromise();
      allData.push(...dataPage);
    }

    return allData;
  }

  resetaccessProfilesToShow() {
    this.messageService.clearError();
    if (this.accessProfiles) {
      this.accessProfilesToShow = [];
      this.accessProfiles.forEach(each => {
        const copy = new AccessProfile();
        Object.assign(copy, each);
        this.accessProfilesToShow.push(copy);
      });
    }
  }

  changeOnBulkAction($event) {
    this.resetaccessProfilesToShow();
    if ($event && $event != '') {
      this.bulkAction = $event;
      if (this.bulkAction === 'EnableAccessProfiles') {
        this.accessProfilesToShow = this.accessProfilesToShow.filter(
          each => !each.enabled
        );
      } else if (this.bulkAction === 'DisableAccessProfiles') {
        this.accessProfilesToShow = this.accessProfilesToShow.filter(
          each => each.enabled
        );
      }
    } else {
      this.bulkAction = null;
    }
    this.unselectAll();
  }

  unselectAll() {
    this.selectAll = false;
    this.atLeastOneSelected = false;
    this.accessProfilesToShow.forEach(each => (each.selected = false));
  }

  changeOnSelectAll() {
    this.messageService.clearError();
    this.searchText = null;
    this.accessProfilesToShow.forEach(
      each => (each.selected = !this.selectAll)
    );
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
    for (const each of this.accessProfilesToShow) {
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
    const arr = [];
    for (const each of this.accessProfilesToShow) {
      if (each.selected) {
        arr.push(each);
      }
    }
    return arr;
  }

  closeModalDisplayMsg() {
    if (!this.errorInvokeApi) {
      this.messageService.add('Changes saved successfully.');
    }
    this.submitConfirmModal.hide();
  }

  async updateAccessProfiles(path: string, enabled: boolean) {
    const arr = this.getSelectedAccessProfiles();
    let processedCount = 0;
    let index = 0;
    for (const each of arr) {
      if (index > 0 && index % 10 == 0) {
        // After processing every batch (10 AP), wait for 1 seconds before calling another API to avoid 429
        // Too Many Requests Error
        await this.sleep(1000);
      }
      index++;

      this.idnService.updateAccessProfile(each, path, enabled).subscribe(
        () => {
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
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useHeader: true,
      headers: [
        'name',
        'description',
        'id',
        'enabled',
        'entitlements',
        'sourceName',
        'entitlementList',
        'ownerAccountID',
        'ownerDisplayName',
      ],
      nullToEmptyString: true,
    };

    const currentUser = this.authenticationService.currentUserValue;
    const fileName = `${currentUser.tenant}-accessprofiles`;
    const arr = [];
    for (const each of this.accessProfiles) {
      const record = Object.assign(each);
      if (each.owner) {
        record.ownerAccountID = each.owner.accountName;
        record.ownerDisplayName = each.owner.displayName;
      }
      arr.push(record);
    }

    new AngularCsv(arr, fileName, options);
  }

  async deleteAccessProfiles() {
    this.messageService.clearAll();
    this.invalidMessage = [];
    if (this.deleteAccessProfileConfirmText !== 'YES TO DELETE') {
      this.invalidMessage.push('Text does not match');
      this.validToSubmit = false;
      return;
    } else {
      this.validToSubmit = true;
    }

    const arr = this.getSelectedAccessProfiles();
    let processedCount = 0;
    let index = 0;
    for (const each of arr) {
      if (index > 0 && index % 10 == 0) {
        // After processing every batch (10 AP), wait for 1 seconds before calling another API to avoid 429
        // Too Many Requests Error
        await this.sleep(1000);
      }
      index++;

      this.idnService.deleteAccessProfile(each).subscribe(
        async () => {
          processedCount++;
          if (processedCount == arr.length) {
            this.deleteAccessProfileConfirmModal.hide();
            this.messageService.add(
              'Access Profiles delete kicked off successfully. Please watch IDN -> Dashboard -> Monitor for status as it takes time to delete.'
            );
            this.hideSubmitConfirmModal();
            this.reset(false);
            await this.sleep(3000);
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
    this.exporting = true;
    // Get the already fetched this.allAPData to export since its in a single page
    for (const each of this.allAPData) {
      const accessProfile = new AccessProfile();
      const jsonData = JSON.stringify(each, null, 4);
      accessProfile.name = each.name;
      const fileName = 'AccessProfile - ' + accessProfile.name + '.json';
      this.zip.file(`${fileName}`, jsonData);
    }
    const currentUser = this.authenticationService.currentUserValue;
    const zipFileName = `${currentUser.tenant}-accessprofiles.zip`;

    this.zip.generateAsync({ type: 'blob' }).then(function (content) {
      saveAs(content, zipFileName);
    });

    this.exporting = false;
  }
}
