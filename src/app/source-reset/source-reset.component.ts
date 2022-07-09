import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Papa } from 'ngx-papaparse';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Source } from '../model/source';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { AuthenticationService } from '../service/authentication-service.service';

@Component({
  selector: 'app-source-reset',
  templateUrl: './source-reset.component.html',
  styleUrls: ['./source-reset.component.css']
})
export class ResetSourceComponent implements OnInit {
  sources: Source[];
  errorInvokeApi: boolean;
  searchText: string;
  loading: boolean;

  sourceToReset: Source;
  validToSubmit: boolean;
  resetSourceNameText: string;
  skipType: string;

  invalidMessage: string[];

  public modalRef: BsModalRef;
  
  @ViewChild('resetSourceAccountsConfirmModal', { static: false }) resetSourceAccountsConfirmModal: ModalDirective;
  @ViewChild('resetSourceEntitlementsConfirmModal', { static: false }) resetSourceEntitlementsConfirmModal: ModalDirective;
  @ViewChild('resetSourceBothConfirmModal', { static: false }) resetSourceBothConfirmModal: ModalDirective;


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
    this.searchText = null;
    this.loading = false;
    this.sourceToReset = null;
    this.validToSubmit = null;
    this.resetSourceNameText = null;
    this.skipType = null;
    this.invalidMessage = [];
    if (clearMsg) {
      this.messageService.clearAll();
      this.errorInvokeApi = false;
    } 
  }

  search() {
    this.loading = true;
    this.idnService.searchAggregationSources()
          .subscribe(allSources => {
            this.sources = [];
            for (let each of allSources) {
              let source = new Source();
              source.id = each.id;
              source.cloudExternalID = each.connectorAttributes.cloudExternalId;
              source.name = each.name;
              source.description = each.description;
              source.type = each.type;

              this.idnService.getSourceCCApi(source.cloudExternalID)
              .subscribe(
                searchResult => {
                    source.accountsCount = searchResult.accountsCount;
                    source.entitlementsCount = searchResult.entitlementsCount;
                },
                err => {
                  this.messageService.handleIDNError(err);
                }
            );
              
              this.sources.push(source);
            }
            this.loading = false;
          });
  }

  resetSourceAccounts() {
    this.messageService.clearAll();
    this.invalidMessage = [];
    // validation
    if (this.resetSourceNameText != this.sourceToReset.name) {
      this.invalidMessage.push("Confirmed source name does not match source name!");
      this.validToSubmit = false;
      return;
    }
    else {
      this.validToSubmit = true;
    }

    this.skipType = "entitlements";

    this.idnService.resetSource(this.sourceToReset.cloudExternalID, this.skipType)
      .subscribe(
        result => {
          //this.closeModalDisplayMsg();
          this.resetSourceAccountsConfirmModal.hide();
          this.messageService.add("Source account reset in progress. Please check Org -> Admin -> Dashboard -> Monitor. Hit Refresh to see the count drop for the source to 0 if successful");
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
      this.invalidMessage.push("Confirmed source name does not match source name!");
      this.validToSubmit = false;
      return;
    }
    else {
      this.validToSubmit = true;
    }

    this.skipType = "accounts";

    this.idnService.resetSource(this.sourceToReset.cloudExternalID, this.skipType)
      .subscribe(
        result => {
          //this.closeModalDisplayMsg();
          this.resetSourceEntitlementsConfirmModal.hide();
          this.messageService.add("Source entitlements reset in progress. Please check Org -> Admin -> Dashboard -> Monitor. Hit Refresh to see the count drop for the source to 0 if successful");
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
      this.invalidMessage.push("Confirmed source name does not match source name!");
      this.validToSubmit = false;
      return;
    }
    else {
      this.validToSubmit = true;
    }

    this.skipType = null;

    this.idnService.resetSource(this.sourceToReset.cloudExternalID, this.skipType)
      .subscribe(
        result => {
          //this.closeModalDisplayMsg();
          this.resetSourceBothConfirmModal.hide();
          this.messageService.add("Source accounts and entitlements in progress. Please check Org -> Admin -> Dashboard -> Monitor. Hit Refresh to see the count drop for the source to 0 if successful");
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
