import { Component, OnInit, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { AuthenticationService } from '../service/authentication-service.service';
import { IdentityProfile, LifecycleStates } from '../model/identity-profile';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { JsonFormatOptions } from '../model/json-format-options';
import { prettyPrintJson } from 'pretty-print-json';
import { BasicAttributes } from '../model/basic-attributes';
import { PageResults } from '../model/page-results';

const RoleDescriptionMaxLength = 50;

@Component({
    selector: 'app-identity-profile-management',
    templateUrl: './identity-profile-management.component.html',
    styleUrls: ['./identity-profile-management.component.css'],
    standalone: false
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
  lifeCycleStates: LifecycleStates[];
  rawObject: string;
  editingLifeCycleState: LifecycleStates;
  filterApplications: Array<BasicAttributes>;

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
    this.rawObject = null;
    this.reset(true);
    this.getAllIdentityProfiles();
    if (this.filterApplications == null) {
      this.getApplicationNames();
    }
  }

  clearRawObject() {
    this.editingLifeCycleState = null;
    this.rawObject = null;
  }

  async getApplicationNames() {
    const pr = new PageResults();
    pr.limit = 1;
    this.filterApplications = new Array<BasicAttributes>();
    const all = new BasicAttributes();
    all.name = 'Loading';
    all.value = '';
    this.filterApplications.push(all);
    this.idnService.getAllSourcesPaged(pr, null).subscribe(async response => {
      const headers = response.headers;
      pr.xTotalCount = headers.get('X-Total-Count');

      if (localStorage.getItem('applicationLookup') != null) {
        this.filterApplications = JSON.parse(
          localStorage.getItem('applicationLookup')
        );
      }
      console.log(this.filterApplications.length + ':' + pr.xTotalCount);
      if (this.filterApplications.length >= pr.xTotalCount) {
        console.log('No reload required lets rock');
      } else {
        console.log('loading applications');
        let max = 0;
        pr.limit = 50;

        await new Promise(resolve => {
          while (pr.totalPages >= max && max < 100) {
            console.log('Start while:' + max);
            this.idnService.getAllSourcesPaged(pr, null).subscribe(response => {
              const searchResult = response.body;
              for (let i = 0; i < searchResult.length; i++) {
                const app = searchResult[i];
                const basic = new BasicAttributes();
                basic.name = app['name'];
                basic.value = app['id'];
                this.addSorted(basic);
              }
            });

            max++;
            pr.nextPage;
            resolve;
          }
        });
      }
    });
  }

  addSorted(basic: BasicAttributes) {
    this.filterApplications.push(basic);
    this.filterApplications.sort((a, b) => a.name.localeCompare(b.name));
  }

  reset(clearMsg: boolean) {
    this.editingLifeCycleState = null;
    this.rawObject = null;
    this.identityProfiles = null;
    this.lifeCycleStates = null;
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

  saveEditedJson() {
    this.editingLifeCycleState.raw = this.rawObject;
    this.idnService
      .updateLifcycleState(this.editingLifeCycleState)
      .subscribe({});
  }

  editJson(input: LifecycleStates) {
    this.editingLifeCycleState = input;
    this.rawObject = JSON.stringify(input.raw, null, 5);
    this.editingLifeCycleState = input;
  }

  viewJson(input: LifecycleStates, replaceAppNames: boolean) {
    const options: JsonFormatOptions = new JsonFormatOptions();
    options.lineNumbers = false;
    options.quoteKeys = true;
    let raw = JSON.stringify(input.raw, null, 5);

    if (replaceAppNames) {
      for (const each of this.filterApplications) {
        if (each.name != 'Loading') {
          raw = raw.replace(
            each.value.toString(),
            each.value.toString() + '--' + each.name.toString()
          );
        }
      }
    }
    //raw = raw.replace("Loading","");
    raw = JSON.parse(raw);

    //https://github.com/center-key/pretty-print-json
    const html = prettyPrintJson.toHtml(raw, options);
    const elem = document.getElementById('jsonRaw');
    elem.innerHTML = html;
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

  getLCM(input) {
    this.loading = true;
    this.idnService.getIdentityProfilesLCS(input).subscribe(lcmState => {
      this.lifeCycleStates = [];

      for (const each of lcmState) {
        const lcm = new LifecycleStates();
        lcm.profileId = input;
        lcm.id = each.id;
        lcm.technicalName = each.technicalName;
        lcm.identityCount = each.identityCount;
        lcm.identityState = each.identityState;
        if (each.accountActions) {
          if (each.accountActions.length > 0) {
            const data = each.accountActions[0];
            lcm.action = data.action;
            lcm.sourceIds = data.sourceIds;
            lcm.excludeSourceIds = data.excludeSourceIds;
            lcm.allSources = data.allSources;
          }
        }

        lcm.raw = each;

        this.lifeCycleStates.push(lcm);
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
