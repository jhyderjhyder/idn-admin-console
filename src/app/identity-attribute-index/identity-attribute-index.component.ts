import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Papa } from 'ngx-papaparse';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { AuthenticationService } from '../service/authentication-service.service';
import { IdentityAttribute } from '../model/identity-attribute';

@Component({
  selector: 'app-identity-attribute-index',
  templateUrl: './identity-attribute-index.component.html',
  styleUrls: ['./identity-attribute-index.component.css']
})
export class IdentityAttributeIndexComponent implements OnInit {
  
  loading: boolean;
  errorMessage: string;
  invalidMessage: string[];
  validToSubmit: boolean;

  selectedUnindexOption: IdentityAttribute;
  selectedIndexOption: IdentityAttribute;
  indexedAttributes: IdentityAttribute[];
  unindexedAttributes: IdentityAttribute[];
  attributeToChange: IdentityAttribute;

  public modalRef: BsModalRef;
  
  @ViewChild('submitUnindexConfirmModal', { static: false }) submitUnindexConfirmModal: ModalDirective;
  @ViewChild('submitIndexConfirmModal', { static: false }) submitIndexConfirmModal: ModalDirective;

  constructor(private papa: Papa,
    private idnService: IDNService, 
    private messageService: MessageService,
    private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    this.reset(true);
    this.getAllIdentityAttributes();
  }

  reset(clearMsg: boolean) {
    this.loading = false;
    this.selectedUnindexOption = null;
    this.selectedIndexOption = null;
    this.indexedAttributes = null;
    this.unindexedAttributes = null;
    this.attributeToChange = null;
    this.invalidMessage = [];
    if (clearMsg) {
      this.messageService.clearAll();
      this.errorMessage = null;
    } 
  }

  getAllIdentityAttributes() {
    this.loading = true;
    this.idnService.getIdentityAttributes()
          .subscribe(allIdentityAttributes => {
            this.indexedAttributes = [];
            this.unindexedAttributes = [];
            for (let each of allIdentityAttributes) {
              let identityAttribute = new IdentityAttribute();
              identityAttribute.displayName = each.displayName;
              identityAttribute.extendedNumber = each.extendedNumber;
              identityAttribute.name = each.name;
              identityAttribute.searchable = each.searchable;
              identityAttribute.sources = each.sources;
              identityAttribute.type = each.type;

              if (each.searchable && each.extendedNumber > 9) {
                this.indexedAttributes.push(identityAttribute);
              } else if (!each.searchable) {
                this.unindexedAttributes.push(identityAttribute);
              }
            }
            this.loading = false;
          });
  }
  
  unindexAttribute() {
    this.messageService.clearAll();
    this.validToSubmit = true;
    
    this.idnService.updateAttributeIndex(this.attributeToChange)
          .subscribe(results => {
            this.submitUnindexConfirmModal.hide();
            this.messageService.add("Changes saved successfully.");
            this.reset(false);
            this.getAllIdentityAttributes();
          },
          err => {
            this.submitUnindexConfirmModal.hide();
            this.messageService.handleIDNError(err);
            this.reset(false);
            this.getAllIdentityAttributes();
          }
        );;
  }

  indexAttribute() {
    this.messageService.clearAll();
    this.validToSubmit = true;
    
    this.idnService.updateAttributeIndex(this.attributeToChange)
          .subscribe(results => {
            this.submitIndexConfirmModal.hide();
            this.messageService.add("Changes saved successfully.");
            this.reset(false);
            this.getAllIdentityAttributes();
          },
          err => {
            this.submitIndexConfirmModal.hide();
            this.messageService.handleIDNError(err);
            this.reset(false);
            this.getAllIdentityAttributes();
          }
        );;
  }

  showUnindexSubmitConfirmModal(selectedAttribute: IdentityAttribute) {
    this.messageService.clearError();
    this.validToSubmit = true;
    this.invalidMessage = [];

    if (!selectedAttribute) {
      this.invalidMessage.push(`Must select an attribute from dropdown list`);
      this.validToSubmit = false;
    }

    if (this.validToSubmit) {
      this.attributeToChange = new IdentityAttribute();
      this.attributeToChange.displayName = selectedAttribute.displayName;
      this.attributeToChange.name = selectedAttribute.name;
      this.attributeToChange.sources = selectedAttribute.sources;
      this.attributeToChange.type = selectedAttribute.type;
      this.attributeToChange.searchable = false;
      this.submitUnindexConfirmModal.show();
    } else {
      this.submitUnindexConfirmModal.show();
    }
  }

  showIndexSubmitConfirmModal(selectedAttribute: IdentityAttribute) {
    this.messageService.clearError();
    this.validToSubmit = true;
    this.invalidMessage = [];

    if (!selectedAttribute) {
      this.invalidMessage.push(`Must select an attribute from dropdown list`);
       this.validToSubmit = false;
    }

    if (this.validToSubmit) {
      this.attributeToChange = new IdentityAttribute();
      this.attributeToChange.displayName = selectedAttribute.displayName;
      this.attributeToChange.name = selectedAttribute.name;
      this.attributeToChange.sources = selectedAttribute.sources;
      this.attributeToChange.type = selectedAttribute.type;
      this.attributeToChange.searchable = true;
      this.submitIndexConfirmModal.show();
    } else {
      this.submitIndexConfirmModal.show();
    }
  }

  hideUnindexConfirmModal() {
    this.submitUnindexConfirmModal.hide();
  }

  hideIndexConfirmModal() {
    this.submitIndexConfirmModal.hide();
  }

}
