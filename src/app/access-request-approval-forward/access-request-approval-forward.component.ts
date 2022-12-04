import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';
import { BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { AuthenticationService } from '../service/authentication-service.service';
import { MessageService } from '../service/message.service';
import { AccessRequestApprovalsPending } from '../model/access-request-approvals-pending';
import { SimpleQueryCondition } from '../model/simple-query-condition';
import { IdentityAttribute } from '../model/identity-attribute';

@Component({
  selector: 'app-access-request-approval-forward',
  templateUrl: './access-request-approval-forward.component.html',
  styleUrls: ['./access-request-approval-forward.component.css']
})

export class AccessRequestApprovalForwardComponent implements OnInit {
  pendingApprovals: AccessRequestApprovalsPending[];
  approvalToForward: AccessRequestApprovalsPending;
  newOwner: string;
  forwardComment: string;
  searchText: string;
  loading: boolean;
  errorMessage: string;
  validToSubmit: boolean;
  invalidMessage: string[];
  identityInfo: IdentityAttribute;

  public modalRef: BsModalRef;
  
  @ViewChild('forwardApprovalConfirmModal', { static: false }) forwardApprovalConfirmModal: ModalDirective;


  constructor(private idnService: IDNService, 
    private authenticationService: AuthenticationService,
    private messageService: MessageService) { }

  ngOnInit() {
    this.reset(true);
    this.getAllAccessRequestApprovalsPending();
  }

  reset(clearMsg: boolean) {
    this.pendingApprovals = null;
    this.approvalToForward = null;
    this.newOwner = null;
    this.forwardComment = null;
    this.searchText = null;
    this.errorMessage = null;
    this.loading = false;
    this.validToSubmit = null;
    this.invalidMessage = null;
    this.identityInfo = null;
    if (clearMsg) {
      this.messageService.clearAll();
    } 
  }

  getAllAccessRequestApprovalsPending() {
   this.loading = true;
   this.idnService.getAccessRequestApprovalsPending()
   .subscribe(
     results => {
     this.pendingApprovals = [];
     for (let each of results) {
       let pendingApproval = new AccessRequestApprovalsPending();
       pendingApproval.id = each.id;
       pendingApproval.name = each.name;
       pendingApproval.requestedObjectName = each.requestedObject.name;
       pendingApproval.requestedObjectType = each.requestedObject.type;
       pendingApproval.requestType = each.requestType;
       pendingApproval.requester = each.requester.name;
       pendingApproval.requestedFor = each.requestedFor.name;
       pendingApproval.owner = each.owner.name;
       pendingApproval.requestCreated = each.requestCreated;
       pendingApproval.created = each.created;

       if(each.sodViolationContext && each.sodViolationContext.state) {
        pendingApproval.sodViolationState = each.sodViolationContext.state;
       }

       this.pendingApprovals.push(pendingApproval);
     }
     this.loading = false;
   });

  }

  checkForwardApproval() {

    this.messageService.clearAll();
    this.invalidMessage = [];
    // validation
    if (this.forwardComment == null) {
      this.invalidMessage.push("Comment cannot be null.");
      this.validToSubmit = false;
      return;
    }

    if (this.newOwner && this.newOwner.trim() != '') {

      let query = new SimpleQueryCondition();
      query.attribute = "name";
      query.value = this.newOwner;

      this.idnService.searchAccounts(query)
      .subscribe(searchResult => { 
        if (searchResult && searchResult.length == 1) {
          this.forwardApproval(searchResult);
         
        } else {
          this.validToSubmit = false;
          this.invalidMessage.push(`Identity Account Name is Invalid.`);
        }
       
    });

    } else {
      this.invalidMessage.push("Identity Account Name cannot be null.");
    }

  }

  forwardApproval(identity){

    this.identityInfo = new IdentityAttribute();

    this.identityInfo.id = identity[0].id;

    this.idnService.forwardAccessRequestApproval(this.approvalToForward.id, this.identityInfo.id, this.forwardComment)
    .subscribe(
      result => {
        this.forwardApprovalConfirmModal.hide();
        this.messageService.add("Approval forwarded succesfully.");
        this.approvalToForward = null;
        this.reset(false);
        this.getAllAccessRequestApprovalsPending();
      },
      err => {
        this.forwardApprovalConfirmModal.hide();
        this.approvalToForward = null;
        this.messageService.handleIDNError(err);
      }
    );


  }

  showForwardApprovalConfirmModal(forwardApproval: AccessRequestApprovalsPending) {

    this.invalidMessage = [];
    this.newOwner = null;
    this.forwardComment = null;
    this.approvalToForward = new AccessRequestApprovalsPending();
    this.approvalToForward.id = forwardApproval.id;
    this.approvalToForward.name = forwardApproval.name;
    this.approvalToForward.requester = forwardApproval.requester;
    this.approvalToForward.requestedFor = forwardApproval.requestedFor;
    this.approvalToForward.owner = forwardApproval.owner;
    this.validToSubmit = false;
    this.forwardApprovalConfirmModal.show();
  }


  hideforwardApprovalConfirmModal() {
    this.forwardApprovalConfirmModal.hide();
  }

  saveInCsv() {
    var options = { 
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useHeader: true,
      headers: ["id", "name", "requestedObjectName", "requestedObjectType", "requestType", "created", "requester", "requestedFor", "owner"],
      nullToEmptyString: true,
    };

    const currentUser = this.authenticationService.currentUserValue;
    let fileName = `${currentUser.tenant}-access-request-approval-pending`;

    let arr = [];
    for (let each of this.pendingApprovals) {
      let record = Object.assign(each);
      arr.push(record);
    }


    let angularCsv: AngularCsv = new AngularCsv(arr, fileName, options);
  }

}