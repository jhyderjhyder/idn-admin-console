import { Component, OnInit, ViewChild } from '@angular/core';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { Entitlement } from '../model/entitlement';
import { PageResults } from '../model/page-results';
import { BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';
import { SimpleQueryCondition } from '../model/simple-query-condition';
import { SourceOwner } from '../model/source-owner';

@Component({
  selector: 'app-entitlement-owners',
  templateUrl: './misc-manage-entitlements.component.html',
  styleUrls: ['./misc-manage-entitlements.component.css'],
})
export class EntitlmentOwnersComponent implements OnInit {
  entitlementsList: Entitlement[];
  entitlementsListToShow: Entitlement[];
  page: PageResults;
  bulkAction: string;
  selectAll: boolean;
  atLeastOneSelected: boolean;
  errorInvokeApi: boolean;
  searchText: string;
  loading: boolean;
  invalidMessage: string[];
  validToSubmit: boolean;
  errorMessage: string;
  newOwnerAll: string;
  newOwnerAllID: string;
  ownerToAdd: Entitlement;
  op: string;
  path: string;
  value: boolean;
  selectedEntitlements: Entitlement[];

  public modalRef: BsModalRef;

  @ViewChild('submitConfirmModal', { static: false })
  submitConfirmModal: ModalDirective;

  constructor(
    private idnService: IDNService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.setupPage();
    this.reset(true);
    this.getAllEntitlements();
  }

  setupPage() {
    this.page = new PageResults();
    this.page.limit = 25;
  }

  /*
  Button on the page to clear everything
  and start over
  */

  reset(clearMsg: boolean) {
    this.entitlementsList = null;
    this.entitlementsListToShow = null;
    this.newOwnerAll = null;
    this.newOwnerAllID = null;
    this.ownerToAdd = null;
    this.bulkAction = null;
    this.selectAll = null;
    this.atLeastOneSelected = null;
    this.searchText = null;
    this.loading = false;
    this.op = null;
    this.path = null;
    this.value = null;
    this.invalidMessage = [];
    this.selectedEntitlements = null;
    this.validToSubmit = null;
    this.errorMessage = null;
    if (clearMsg) {
      this.messageService.clearAll();
      this.errorInvokeApi = false;
    }
  }

  /**
   * Button on the page to seach for new records
   */
  submit() {
    this.setupPage();
    this.getAllEntitlements();
  }

  /*
   * Paganation logic
   */

  //Get the next page
  getNextPage() {
    this.page.nextPage;
    this.getAllEntitlements();
  }
  //Get the previous page
  getPrevPage() {
    this.page.prevPage;
    this.getAllEntitlements();
  }
  //Pick the page Number you want
  getOnePage(input) {
    this.page.getPageByNumber(input - 1);
    this.getAllEntitlements();
  }

  /*
  Lets make sure the user is found cloned from
  Workitem forward
  */

  resetEntitlementsToShow() {
    this.messageService.clearError();
    if (this.entitlementsList) {
      this.entitlementsListToShow = [];
      this.entitlementsList.forEach(each => {
        const copy = new Entitlement();
        Object.assign(copy, each);
        this.entitlementsListToShow.push(copy);
      });
    }
  }

  changeOnBulkAction($event) {
    this.resetEntitlementsToShow();
    if ($event && $event != '') {
      this.bulkAction = $event;
      if (this.bulkAction === 'AddOwner') {
        this.entitlementsListToShow = this.entitlementsListToShow.filter(
          each => !each.ownerName
        );
      } else if (this.bulkAction === 'UpdateOwner') {
        this.entitlementsListToShow = this.entitlementsListToShow.filter(
          each => each.ownerName
        );
      } else if (this.bulkAction === 'RemoveOwner') {
        this.entitlementsListToShow = this.entitlementsListToShow.filter(
          each => each.ownerName
        );
      } else if (this.bulkAction === 'MarkAsRequestable') {
        this.entitlementsListToShow = this.entitlementsListToShow.filter(
          each => !each.requestable
        );
      } else if (this.bulkAction === 'MarkAsNonRequestable') {
        this.entitlementsListToShow = this.entitlementsListToShow.filter(
          each => each.requestable
        );
      } else if (this.bulkAction === 'MarkAsPrivileged') {
        this.entitlementsListToShow = this.entitlementsListToShow.filter(
          each => !each.privileged
        );
      } else if (this.bulkAction === 'MarkAsNonPrivileged') {
        this.entitlementsListToShow = this.entitlementsListToShow.filter(
          each => each.privileged
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
    this.entitlementsListToShow.forEach(each => (each.selected = false));
  }

  changeOnSelectAll() {
    this.messageService.clearError();
    this.searchText = null;
    this.entitlementsListToShow.forEach(
      each => (each.selected = !this.selectAll)
    );
  }

  applyNewOwnerToAllSelected() {
    this.messageService.clearError();
    this.validToSubmit = true;
    this.selectedEntitlements = [];

    for (const each of this.entitlementsListToShow) {
      if (each.selected) {
        this.atLeastOneSelected = true;
        this.selectedEntitlements.push(each);
      }
    }

    if (!this.atLeastOneSelected) {
      this.messageService.setError('Select at least one item to submit.');
      this.validToSubmit = false;
    }

    if (this.newOwnerAll && this.newOwnerAll.trim() != '') {
      const query = new SimpleQueryCondition();
      query.attribute = 'name';
      query.value = this.newOwnerAll;

      this.idnService.searchAccounts(query).subscribe(searchResult => {
        if (searchResult && searchResult.length == 1) {
          this.newOwnerAllID = searchResult[0].id;
        } else {
          this.messageService.setError(
            `New owner's account name (${this.newOwnerAll}) is invalid.`
          );
          this.validToSubmit = false;
        }
      });
    } else {
      this.messageService.setError(
        'Owner account name is required to apply to the selected items.'
      );
      this.validToSubmit = false;
    }

    if (this.validToSubmit) {
      this.submitConfirmModal.show();
    }
  }

  removeOwnerToAllSelected() {
    this.messageService.clearError();
    this.validToSubmit = true;
    this.selectedEntitlements = [];

    for (const each of this.entitlementsListToShow) {
      if (each.selected) {
        this.atLeastOneSelected = true;
        this.selectedEntitlements.push(each);
      }
    }

    if (!this.atLeastOneSelected) {
      this.messageService.setError('Select at least one item to submit.');
      this.validToSubmit = false;
    }

    if (this.validToSubmit) {
      this.submitConfirmModal.show();
    }
  }

  switchRequestableFlagToAllSelected() {
    this.messageService.clearError();
    this.validToSubmit = true;
    this.selectedEntitlements = [];

    for (const each of this.entitlementsListToShow) {
      if (each.selected) {
        this.atLeastOneSelected = true;
        this.selectedEntitlements.push(each);
      }
    }

    if (!this.atLeastOneSelected) {
      this.messageService.setError('Select at least one item to submit.');
      this.validToSubmit = false;
    }

    if (this.validToSubmit) {
      this.submitConfirmModal.show();
    }
  }

  hideSubmitConfirmModal() {
    this.submitConfirmModal.hide();
  }

  closeModalDisplayMsg() {
    if (this.errorMessage != null) {
      this.messageService.setError(this.errorMessage);
    } else {
      this.messageService.add('Changes saved successfully.');
    }
    this.submitConfirmModal.hide();
  }

  async updateOwner() {
    const arr = this.entitlementsListToShow.filter(each => each.selected);
    let processedCount = 0;
    let index = 0;
    for (const each of arr) {
      if (index > 0 && index % 10 == 0) {
        // After processing every batch (10 Entitlements), wait for 3 seconds before calling another API to avoid 429
        // Too Many Requests Error
        await this.sleep(3000);
      }
      index++;

      switch (this.bulkAction) {
        case 'AddOwner':
          this.op = 'add';
          break;
        case 'UpdateOwner':
          this.op = 'replace';
          break;
        case 'RemoveOwner':
          this.op = 'remove';
          break;
      }

      this.idnService
        .changeEntitlementOwner(each.id, this.op, this.newOwnerAllID)
        .subscribe(
          () => {
            processedCount++;
            if (processedCount == arr.length) {
              this.closeModalDisplayMsg();
              this.reset(true);
              this.getAllEntitlements();
            }
          },
          () => {
            this.errorMessage = 'Error to submit the changes.';
            processedCount++;
            if (processedCount == arr.length) {
              this.closeModalDisplayMsg();
              this.reset(false);
              this.getAllEntitlements();
            }
          }
        );
    }
  }

  async switchRequestableFlag() {
    const arr = this.entitlementsListToShow.filter(each => each.selected);
    let processedCount = 0;
    let index = 0;
    for (const each of arr) {
      if (index > 0 && index % 10 == 0) {
        // After processing every batch (10 Entitlements), wait for 3 seconds before calling another API to avoid 429
        // Too Many Requests Error
        await this.sleep(3000);
      }
      index++;

      switch (this.bulkAction) {
        case 'MarkAsRequestable':
          this.op = 'replace';
          this.path = '/requestable';
          this.value = true;
          break;
        case 'MarkAsNonRequestable':
          this.op = 'replace';
          this.path = '/requestable';
          this.value = false;
          break;
        case 'MarkAsPrivileged':
          this.op = 'replace';
          this.path = '/privileged';
          this.value = true;
          break;
        case 'MarkAsNonPrivileged':
          this.op = 'replace';
          this.path = '/privileged';
          this.value = false;
          break;
      }

      this.idnService
        .changeEntitlementFlags(each.id, this.op, this.path, this.value)
        .subscribe(
          () => {
            processedCount++;
            if (processedCount == arr.length) {
              this.closeModalDisplayMsg();
              this.reset(true);
              this.getAllEntitlements();
            }
          },
          () => {
            this.errorMessage = 'Error to submit the changes.';
            processedCount++;
            if (processedCount == arr.length) {
              this.closeModalDisplayMsg();
              this.reset(false);
              this.getAllEntitlements();
            }
          }
        );
    }
  }

  getAllEntitlements() {
    this.loading = true;
    this.entitlementsList = [];
    this.entitlementsListToShow = [];
    this.bulkAction = null;

    this.idnService
      .getAllEntitlementsPaged(this.searchText, this.page)
      .subscribe(async response => {
        const searchResult = response.body;
        const headers = response.headers;
        this.page.xTotalCount = headers.get('X-Total-Count');

        for (const each of searchResult) {
          const entitlement = new Entitlement();
          entitlement.id = each.id;
          entitlement.attribute = each.attribute;
          entitlement.value = each.value;
          entitlement.name = each.name;
          entitlement.sourceName = each.source.name;
          entitlement.description = each.description;
          entitlement.requestable = each.requestable;
          entitlement.privileged = each.privileged;
          if (each.owner != null) {
            entitlement.ownerName = each.owner.name;
            entitlement.ownerId = each.owner.id;

            let index = 0;
            if (entitlement.ownerId) {
              if (index > 0 && index % 10 == 0) {
                // After processing every batch (10 Entitlements), wait for 3 seconds before calling another API to avoid 429
                // Too Many Requests Error
                await this.sleep(3000);
              }
              index++;

              const query = new SimpleQueryCondition();
              query.attribute = 'id';
              query.value = each.owner.id;

              this.idnService.searchAccounts(query).subscribe(searchResult => {
                if (searchResult.length > 0) {
                  entitlement.owner = new SourceOwner();
                  entitlement.owner.accountId = searchResult[0].id;
                  entitlement.owner.accountName = searchResult[0].name;
                  entitlement.owner.displayName = searchResult[0].displayName;
                }
              });
            }
          }
          this.entitlementsList.push(entitlement);
          this.entitlementsListToShow.push(entitlement);
        }
        this.loading = false;
      });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
