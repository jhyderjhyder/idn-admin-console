import { Component, OnInit, ViewChild } from '@angular/core';
import { BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { AuthenticationService } from '../service/authentication-service.service';
import { MessageService } from '../service/message.service';
import { IdentityAttribute } from '../model/identity-attribute';
import { Entitlement } from '../model/entitlement';




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

  public modalRef: BsModalRef;

  @ViewChild('forwardWorkItemConfirmModal', { static: false })
  forwardWorkItemConfirmModal: ModalDirective;

  constructor(
    private idnService: IDNService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.reset(true);
    this.getAllEntitlements();
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
    this.entValue= null;
  }

  submit(){
    this.getAllEntitlements();
  }

  getAllEntitlements() {
    this.loading = true;
    this.idnService.getAllEntitlements(this.entValue).subscribe(results => {
      
      this.entitlementsList = [];
      //console.table(results);
      for (const each of results) {
        const ent = new Entitlement();
        ent.attribute = each.attribute;
        ent.value = each.value;
        ent.created = each.created;
        ent.name = each.name;
        ent.sourceName = each.source.name;
        ent.description = each.description;
        ent.requestable = each.requestable;
        if (each.owner!=null){
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
  console.log("todo csv" + currentUser);
  }

 
}
