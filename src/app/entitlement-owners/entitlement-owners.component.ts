import { Component, OnInit, ViewChild } from '@angular/core';
import { BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { AuthenticationService } from '../service/authentication-service.service';
import { MessageService } from '../service/message.service';
import { IdentityAttribute } from '../model/identity-attribute';
import { Entitlement } from '../model/entitlement';
import { PageResults } from '../model/page-results';
import { SimpleQueryCondition } from '../model/simple-query-condition';

@Component({
  selector: 'app-entitlement-owners',
  templateUrl: './entitlement-owners.component.html',
  styleUrls: ['./entitlement-owners.component.css'],
})

export class EntitlmentOwnersComponent implements OnInit {
  loading: boolean;
  errorMessage: string;
  validToSubmit: boolean;
  invalidMessage: string[];
  identityInfo: IdentityAttribute;
  entitlementsList: Array<{}>;
  entValue: string;
  page: PageResults;
  newOwner: string;
  e: Entitlement;

  public modalRef: BsModalRef;

  @ViewChild('forwardWorkItemConfirmModal', { static: false })
  forwardWorkItemConfirmModal: ModalDirective;

  constructor(
    private idnService: IDNService,
    private authenticationService: AuthenticationService,
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

  reset(clearMsg: boolean) {
    this.errorMessage = null;
    this.loading = false;
    this.validToSubmit = null;
    this.invalidMessage = null;
    this.identityInfo = null;
    if (clearMsg) {
      this.messageService.clearAll();
    }
    this.entValue = null;
  }

  submit() {
    this.setupPage();
    this.getAllEntitlements();
  }


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

  checkEntitlementOwner() {
    this.messageService.clearAll();
    this.invalidMessage = [];
    // validation


    if (this.newOwner && this.newOwner.trim() != '') {
      const query = new SimpleQueryCondition();
      query.attribute = 'name';
      query.value = this.newOwner;

      this.idnService.searchAccounts(query).subscribe(searchResult => {
        if (searchResult && searchResult.length == 1) {
          //this.invalidMessage.push(`Identity Account Name is Good.`);
          this.updateOwner(searchResult);
        } else {
          this.validToSubmit = false;
          this.invalidMessage.push(`Identity Account Name is Invalid.`);
        }
      });
    } else {
      this.invalidMessage.push('Identity Account Name cannot be null.');
    }
  }



  updateOwner(identity) {
    this.identityInfo = new IdentityAttribute();

    this.identityInfo.id = identity[0].id;

    this.idnService
      .changeEntitlementOwner(
        this.e.id,
        this.identityInfo.id
      )
      .subscribe(
        () => {
          
          this.messageService.add('Ownership Updated');
          //this.e = null;
          this.reset(true);
         
        },
        err => {
          console.log("error:" + err)
          //this.e = null;
          this.messageService.handleIDNError(err);
        }
      );
  }


  showOwnerUpdateModel(input){
    this.e = input;
  }

  getAllEntitlements() {
    this.loading = true;
    this.idnService.getAllEntitlementsPaged(this.entValue, this.page).subscribe(response => {
        const searchResult = response.body;
        const headers = response.headers;
        this.page.xTotalCount = headers.get('X-Total-Count');
        this.entitlementsList = [];
        for (const each of searchResult) {
          const ent = new Entitlement();
          ent.id = each.id;
          ent.attribute = each.attribute;
          ent.value = each.value;
          ent.created = each.created;
          ent.name = each.name;
          ent.sourceName = each.source.name;
          ent.description = each.description;
          ent.requestable = each.requestable;
          if (each.owner != null) {
            ent.ownerName = each.owner.name;
            ent.ownerId = each.owner.id;
          }
          this.entitlementsList.push(ent);
        }
        this.loading = false;
      });
  }

  saveInCsv() {
    const currentUser = this.authenticationService.currentUserValue;
    console.log('todo csv' + currentUser);
  }

}
