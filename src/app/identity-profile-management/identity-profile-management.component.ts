import { Component, OnInit, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { AuthenticationService } from '../service/authentication-service.service';
import { IdentityProfile } from '../model/identity-profile';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';

const RoleDescriptionMaxLength = 50;

@Component({
  selector: 'app-identity-profile-management',
  templateUrl: './identity-profile-management.component.html',
  styleUrls: ['./identity-profile-management.component.css'],
})
export class IdentityProfileManagementComponent implements OnInit {
  identityProfiles: IdentityProfile[];
  loading: boolean;
  exporting: boolean;
  searchText: string;
  selectAll: boolean;
  newPriorityAll: string;
  errorMessage: string;
  invalidMessage: string[];
  validToSubmit: boolean;
  profileToRefresh: string;
  allIdentityProfiles: any;

  zip: JSZip = new JSZip();

  public modalRef: BsModalRef;

  @ViewChild('submitConfirmModal', { static: false })
  submitConfirmModal: ModalDirective;
  @ViewChild('submitRefreshConfirmModal', { static: false })
  submitRefreshConfirmModal: ModalDirective;

  constructor(
    private idnService: IDNService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit() {
    this.reset(true);
    this.getAllIdentityProfiles();
  }

  reset(clearMsg: boolean) {
    this.identityProfiles = null;
    this.selectAll = false;
    this.newPriorityAll = null;
    this.searchText = null;
    this.loading = false;
    this.exporting = false;
    this.allIdentityProfiles = null;
    this.invalidMessage = [];
    if (clearMsg) {
      this.messageService.clearAll();
      this.errorMessage = null;
    }
  }

  getAllIdentityProfiles() {
    this.loading = true;
    this.idnService.getIdentityProfiles().subscribe(allIdentityProfiles => {
      this.identityProfiles = [];
      this.allIdentityProfiles = allIdentityProfiles;
      for (const each of allIdentityProfiles) {
        const identityProfile = new IdentityProfile();
        identityProfile.id = each.id;
        identityProfile.name = each.name;
        if (each.description) {
          if (each.description.length > RoleDescriptionMaxLength) {
            identityProfile.description =
              each.description.substring(0, RoleDescriptionMaxLength) + '...';
          } else {
            identityProfile.description = each.description;
          }
        }

        identityProfile.priority = each.priority;
        // identityProfile.authSourceName = each.authoritativeSource.name;
        identityProfile.authSourceName = each.authoritativeSource.name;
        //identityProfile.identityRefreshRequired = each.identityRefreshRequired;
        if (each.status === 'DIRTY') {
          identityProfile.identityRefreshRequired = true;
        } else {
          identityProfile.identityRefreshRequired = false;
        }

        identityProfile.identityCount = each.identityCount;

        // if (each.identityExceptionReportReference && each.identityExceptionReportReference.taskResultId != null) {
        //   identityProfile.hasIdentityException = true;
        // } else {
        //   identityProfile.hasIdentityException = false;
        // }

        if (each.report) {
          identityProfile.hasIdentityException = true;
        } else {
          identityProfile.hasIdentityException = false;
        }

        this.identityProfiles.push(identityProfile);
      }
      this.loading = false;
    });
  }

  refreshIdentityProfile() {
    this.messageService.clearAll();
    this.invalidMessage = [];
    this.validToSubmit = true;

    this.idnService.refreshIdentityProfilev1(this.profileToRefresh).subscribe(
      () => {
        this.submitRefreshConfirmModal.hide();
        this.profileToRefresh = null;
        this.messageService.add('Identity Profile Refresh Started');
        this.getAllIdentityProfiles();
      },
      err => {
        this.messageService.handleIDNError(err);
      }
    );
  }

  changeOnSelectAll() {
    this.messageService.clearError();
    this.searchText = null;
    this.identityProfiles.forEach(each => {
      each.selected = !this.selectAll;
      if (each.selected) {
        each.newPriority = each.priority;
      } else {
        if (each.newPriority) {
          each.newPriority = null;
        }
      }
    });
  }

  changeOnSelect($event, index: number) {
    this.messageService.clearError();
    if (!$event.currentTarget.checked) {
      this.selectAll = false;
      if (this.identityProfiles[index].newPriority) {
        this.identityProfiles[index].newPriority = null;
      }
    } else {
      this.identityProfiles[index].newPriority =
        this.identityProfiles[index].priority;
    }
  }

  showSubmitConfirmModal() {
    this.messageService.clearError();
    this.validToSubmit = true;
    this.invalidMessage = [];
    const selectedIdentityProfiles = [];
    for (const each of this.identityProfiles) {
      if (each.selected) {
        if (
          each.newPriority == null ||
          each.newPriority.toString().trim() == ''
        ) {
          this.invalidMessage.push(
            `Priority of Identity Profile (name: ${each.name}) can not be empty.`
          );
          this.validToSubmit = false;
        } else if (each.newPriority == each.priority) {
          this.invalidMessage.push(
            `Priority of Identity Profile (name: ${each.name}) is not changed.`
          );
          this.validToSubmit = false;
        }
        selectedIdentityProfiles.push(each);
      }
    }
    if (selectedIdentityProfiles.length == 0) {
      this.invalidMessage.push('Select at least one item to submit.');
      this.validToSubmit = false;
    }
    this.submitConfirmModal.show();
  }

  showRefreshSubmitConfirmModal(profileId: string) {
    this.messageService.clearError();
    this.validToSubmit = true;
    this.loading = true;
    this.invalidMessage = [];

    if (this.validToSubmit) {
      this.profileToRefresh = profileId;
      this.submitRefreshConfirmModal.show();
    } else {
      this.submitRefreshConfirmModal.show();
    }
  }

  hideRefreshSubmitConfirmModal() {
    this.submitRefreshConfirmModal.hide();
    this.ngOnInit();
  }

  hideSubmitConfirmModal() {
    this.submitConfirmModal.hide();
    this.ngOnInit();
  }

  async updateProfilePriority() {
    const arr = this.identityProfiles.filter(each => each.selected);
    let processedCount = 0;
    let index = 0;
    for (const each of arr) {
      if (index > 0 && index % 10 == 0) {
        // After processing every batch (10 identity profiles), wait for 1 second before calling another API to avoid 429
        // Too Many Requests Error
        await this.sleep(1000);
      }
      index++;

      this.idnService.updateProfilePriorityv1(each).subscribe(
        () => {
          processedCount++;
          if (processedCount == arr.length) {
            this.closeModalDisplayMsg();
            this.reset(false);
            this.ngOnInit();
          }
        },
        () => {
          this.errorMessage = 'Error to submit the changes.';
          processedCount++;
          if (processedCount == arr.length) {
            this.closeModalDisplayMsg();
            // this.reset(false);
            // this.ngOnInit();
          }
        }
      );
    }
  }

  closeModalDisplayMsg() {
    if (this.errorMessage != null) {
      this.messageService.setError(this.errorMessage);
    } else {
      this.messageService.add('Changes saved successfully.');
    }
    this.submitConfirmModal.hide();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  exportAllIdentityProfiles() {
    this.exporting = true;

    // Get the already fetched this.allIdentityProfiles to export since its in a single page
    for (const each of this.allIdentityProfiles) {
      const identityProfile = new IdentityProfile();
      const jsonData = JSON.stringify(each, null, 4);
      identityProfile.name = each.name;
      const fileName = 'IdentityProfile - ' + identityProfile.name + '.json';
      this.zip.file(`${fileName}`, jsonData);
    }
    const currentUser = this.authenticationService.currentUserValue;
    const zipFileName = `${currentUser.tenant}-identityprofiles.zip`;

    this.zip.generateAsync({ type: 'blob' }).then(function (content) {
      saveAs(content, zipFileName);
    });

    this.exporting = false;
  }
}
