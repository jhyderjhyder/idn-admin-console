import { Component, OnInit, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Source } from '../model/source';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { PageResults } from '../model/page-results';

@Component({
  selector: 'app-source-reset',
  templateUrl: './source-reset.component.html',
  styleUrls: ['./source-reset.component.css'],
})
export class ResetSourceComponent implements OnInit {
  sources: Source[];
  errorInvokeApi: boolean;
  searchText: string;
  loading: boolean;
  loadedCount: number;
  sourceCount: number;

  sourceToReset: Source;
  validToSubmit: boolean;
  resetSourceNameText: string;
  skipType: string;

  invalidMessage: string[];

  public modalRef: BsModalRef;

  @ViewChild('resetSourceAccountsConfirmModal', { static: false })
  resetSourceAccountsConfirmModal: ModalDirective;
  @ViewChild('resetSourceEntitlementsConfirmModal', { static: false })
  resetSourceEntitlementsConfirmModal: ModalDirective;
  @ViewChild('resetSourceBothConfirmModal', { static: false })
  resetSourceBothConfirmModal: ModalDirective;

  constructor(
    private idnService: IDNService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.reset(true);
    //this.search();
  }

  reset(clearMsg: boolean) {
    this.sources = null;
    this.searchText = null;
    this.loading = false;
    this.sourceToReset = null;
    this.validToSubmit = null;
    this.resetSourceNameText = null;
    this.skipType = null;
    this.loadedCount = null;
    this.sourceCount = null;
    this.invalidMessage = [];
    if (clearMsg) {
      this.messageService.clearAll();
      this.errorInvokeApi = false;
    }
  }

  search() {
    this.loading = true;
    this.idnService
      .getAllSourcesPaged(new PageResults(), this.searchText)
      .subscribe(response => {
        const allSources = response.body;
        this.sources = [];

        this.sourceCount = allSources.length;

        //Sort it alphabetically
        //allSources.sort((a, b) => a.name.localeCompare(b.name));

        let index = 0;
        for (const each of allSources) {
          if (index > 0 && index % 10 == 0) {
            // After processing every batch (10 sources), wait for 1 second before calling another API to avoid 429
            // Too Many Requests Error
            //await this.sleep(1000);
          }
          index++;

          const source = new Source();
          source.id = each.id;
          source.cloudExternalID = each.id;
          source.name = each.name;
          source.description = each.description;
          source.type = each.type;

          this.idnService
            .countApplicationAccounts(source.cloudExternalID, false)
            .subscribe(response => {
              const headers = response.headers;
              source.accountsCount = headers.get('X-Total-Count');
              //source.entitlementsCount = searchResult.entitlementsCount;
            });

          this.idnService
            .countEntitlements(source.cloudExternalID)
            .subscribe(response => {
              const headers = response.headers;
              source.entitlementsCount = headers.get('X-Total-Count');
            });

          this.sources.push(source);
          this.loadedCount = this.sources.length;
        }
        this.loading = false;
      });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  resetSourceAccounts() {
    this.messageService.clearAll();
    this.invalidMessage = [];
    // validation
    if (this.resetSourceNameText != this.sourceToReset.name) {
      this.invalidMessage.push(
        'Confirmed source name does not match source name!'
      );
      this.validToSubmit = false;
      return;
    } else {
      this.validToSubmit = true;
    }

    this.skipType = 'entitlements';

    this.idnService
      .resetSource(this.sourceToReset.cloudExternalID, this.skipType)
      .subscribe(
        () => {
          //this.closeModalDisplayMsg();
          this.resetSourceAccountsConfirmModal.hide();
          this.messageService.add(
            'Source account reset in progress. Please check Org -> Admin -> Dashboard -> Monitor. Hit Refresh to see the count drop for the source to 0 if successful'
          );
          this.sourceToReset = null;
          this.skipType = null;
          this.reset(false);
          this.search();
        },
        err => {
          this.resetSourceAccountsConfirmModal.hide();
          this.sourceToReset = null;
          this.skipType = null;
          this.messageService.handleIDNError(err);
        }
      );
  }

  resetSourceEntitlements() {
    this.messageService.clearAll();
    this.invalidMessage = [];
    // validation
    if (this.resetSourceNameText != this.sourceToReset.name) {
      this.invalidMessage.push(
        'Confirmed source name does not match source name!'
      );
      this.validToSubmit = false;
      return;
    } else {
      this.validToSubmit = true;
    }

    this.skipType = 'accounts';

    this.idnService
      .resetSourceEnt(this.sourceToReset.cloudExternalID, this.skipType)
      .subscribe(
        () => {
          //this.closeModalDisplayMsg();
          this.resetSourceEntitlementsConfirmModal.hide();
          this.messageService.add(`Source entitlements reset in progress. 
                                Please check Org -> Admin -> Dashboard -> Monitor. 
                                Hit Refresh to see the count drop for the source to 0 if successful`);
          this.sourceToReset = null;
          this.skipType = null;
          this.reset(false);
          this.search();
        },
        err => {
          this.resetSourceEntitlementsConfirmModal.hide();
          this.sourceToReset = null;
          this.skipType = null;
          this.messageService.handleIDNError(err);
        }
      );
  }

  resetSourceBoth() {
    this.messageService.clearAll();
    this.invalidMessage = [];
    // validation
    if (this.resetSourceNameText != this.sourceToReset.name) {
      this.invalidMessage.push(
        'Confirmed source name does not match source name!'
      );
      this.validToSubmit = false;
      return;
    } else {
      this.validToSubmit = true;
    }

    this.skipType = null;

    this.idnService
      .resetSource(this.sourceToReset.cloudExternalID, this.skipType)
      .subscribe(
        () => {
          //this.closeModalDisplayMsg();
          this.resetSourceBothConfirmModal.hide();
          this.messageService
            .add(`Source accounts and entitlements in progress. 
                          Please check Org -> Admin -> Dashboard -> Monitor. 
                          Hit Refresh to see the count drop for the source to 0 if successful`);
          this.sourceToReset = null;
          this.skipType = null;
          this.reset(false);
          this.search();
        },
        err => {
          this.resetSourceBothConfirmModal.hide();
          this.sourceToReset = null;
          this.skipType = null;
          this.messageService.handleIDNError(err);
        }
      );

    this.idnService
      .resetSourceEnt(this.sourceToReset.cloudExternalID, this.skipType)
      .subscribe(
        () => {
          //this.closeModalDisplayMsg();
          this.resetSourceBothConfirmModal.hide();
          this.messageService
            .add(`Source accounts and entitlements in progress. 
                          Please check Org -> Admin -> Dashboard -> Monitor. 
                          Hit Refresh to see the count drop for the source to 0 if successful`);
          this.sourceToReset = null;
          this.skipType = null;
          this.reset(false);
          this.search();
        },
        err => {
          this.resetSourceBothConfirmModal.hide();
          this.sourceToReset = null;
          this.skipType = null;
          this.messageService.handleIDNError(err);
        }
      );
  }

  showResetSourceAccountsConfirmModal(selectedSource: Source) {
    this.invalidMessage = [];
    this.resetSourceNameText = null;
    this.sourceToReset = new Source();
    this.sourceToReset.id = selectedSource.id;
    this.sourceToReset.name = selectedSource.name;
    this.sourceToReset.type = selectedSource.type;
    this.sourceToReset.description = selectedSource.description;
    this.sourceToReset.cloudExternalID = selectedSource.cloudExternalID;
    this.validToSubmit = false;
    this.resetSourceAccountsConfirmModal.show();
  }

  showResetSourceEntitlementsConfirmModal(selectedSource: Source) {
    this.invalidMessage = [];
    this.resetSourceNameText = null;
    this.sourceToReset = new Source();
    this.sourceToReset.id = selectedSource.id;
    this.sourceToReset.name = selectedSource.name;
    this.sourceToReset.type = selectedSource.type;
    this.sourceToReset.description = selectedSource.description;
    this.sourceToReset.cloudExternalID = selectedSource.cloudExternalID;
    this.validToSubmit = false;
    this.resetSourceEntitlementsConfirmModal.show();
  }

  showResetSourceBothConfirmModal(selectedSource: Source) {
    this.invalidMessage = [];
    this.resetSourceNameText = null;
    this.sourceToReset = new Source();
    this.sourceToReset.id = selectedSource.id;
    this.sourceToReset.name = selectedSource.name;
    this.sourceToReset.type = selectedSource.type;
    this.sourceToReset.description = selectedSource.description;
    this.sourceToReset.cloudExternalID = selectedSource.cloudExternalID;
    this.validToSubmit = false;
    this.resetSourceBothConfirmModal.show();
  }

  hideResetSourceAccountsConfirmModal() {
    this.resetSourceAccountsConfirmModal.hide();
  }

  hideResetSourceEntitlementsConfirmModal() {
    this.resetSourceEntitlementsConfirmModal.hide();
  }

  hideResetSourceBothConfirmModal() {
    this.resetSourceBothConfirmModal.hide();
  }
}
