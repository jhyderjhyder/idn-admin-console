import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';
import { BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { AuthenticationService } from '../service/authentication-service.service';
import { MessageService } from '../service/message.service';
import { WorkItem } from '../model/work-item';
import { SimpleQueryCondition } from '../model/simple-query-condition';
import { IdentityAttribute } from '../model/identity-attribute';

@Component({
  selector: 'app-work-items-forward',
  templateUrl: './work-items-forward.component.html',
  styleUrls: ['./work-items-forward.component.css']
})

export class WorkItemsForwardComponent implements OnInit {
  pendingWorkItems: WorkItem[];
  workItemToForward: WorkItem;
  newOwner: string;
  forwardComment: string;
  searchText: string;
  loading: boolean;
  errorMessage: string;
  validToSubmit: boolean;
  invalidMessage: string[];
  identityInfo: IdentityAttribute;

  public modalRef: BsModalRef;
  
  @ViewChild('forwardWorkItemConfirmModal', { static: false }) forwardWorkItemConfirmModal: ModalDirective;


  constructor(private idnService: IDNService, 
    private authenticationService: AuthenticationService,
    private messageService: MessageService) { }

  ngOnInit() {
    this.reset(true);
    this.getAllPendingWorkItems();
  }

  reset(clearMsg: boolean) {
    this.pendingWorkItems = null;
    this.workItemToForward = null;
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

  getAllPendingWorkItems() {
   this.loading = true;
   this.idnService.getWorkItemsPending()
   .subscribe(
     results => {
     this.pendingWorkItems = [];
     for (let each of results) {
       let pendingWorkItem = new WorkItem();
       pendingWorkItem.id = each.id;

       if (each.requesterDisplayName) {
        pendingWorkItem.requesterDisplayName = each.requesterDisplayName;
       }
       else {
        pendingWorkItem.requesterDisplayName = "NULL";
       }       
       
       pendingWorkItem.created = each.created;
       pendingWorkItem.description = each.description;
       pendingWorkItem.state = each.state;
       pendingWorkItem.type = each.type;

       if (each.remediationItems && each.remediationItems.length) {
        pendingWorkItem.remediationItems = each.remediationItems.length;
       }
       else {
        pendingWorkItem.remediationItems = "0";
       }

       if (each.approvalItems && each.approvalItems.length) {
        pendingWorkItem.approvalItems = each.approvalItems.length;
       }
       else {
        pendingWorkItem.approvalItems = "0";
       }

       if (each.ownerId) {
        let query = new SimpleQueryCondition();
        query.attribute = "name";
        query.value = each.ownerName;

        this.idnService.searchAccounts(query)
        .subscribe(searchResult => { 
          if (searchResult.length > 0) {
            pendingWorkItem.ownerDisplayName = searchResult[0].displayName;
          }
          else {
            pendingWorkItem.ownerDisplayName = "NULL";
          }
          });
        }
        else {
          pendingWorkItem.ownerDisplayName = "NULL";
        }

       this.pendingWorkItems.push(pendingWorkItem);
     }
     this.loading = false;
   });

  }

  checkForwardWorkItem() {

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
          this.forwardWorkItem(searchResult);
         
        } else {
          this.validToSubmit = false;
          this.invalidMessage.push(`Identity Account Name is Invalid.`);
        }
       
    });

    } else {
      this.invalidMessage.push("Identity Account Name cannot be null.");
    }

  }

  forwardWorkItem(identity){

    this.identityInfo = new IdentityAttribute();

    this.identityInfo.id = identity[0].id;

    this.idnService.forwardPendingWorkItem(this.workItemToForward.id, this.identityInfo.id, this.forwardComment)
    .subscribe(
      result => {
        this.forwardWorkItemConfirmModal.hide();
        this.messageService.add("Work Item forwarded succesfully.");
        this.workItemToForward = null;
        this.reset(false);
        this.getAllPendingWorkItems();
      },
      err => {
        this.forwardWorkItemConfirmModal.hide();
        this.workItemToForward = null;
        this.messageService.handleIDNError(err);
      }
    );


  }

  showforwardWorkItemConfirmModal(forwardWorkItem: WorkItem) {

    this.invalidMessage = [];
    this.newOwner = null;
    this.forwardComment = null;
    this.workItemToForward = new WorkItem();
    this.workItemToForward.id = forwardWorkItem.id;
    this.workItemToForward.description = forwardWorkItem.description;
    this.workItemToForward.requesterDisplayName = forwardWorkItem.requesterDisplayName;
    this.workItemToForward.ownerDisplayName = forwardWorkItem.ownerDisplayName;
    this.validToSubmit = false;
    this.forwardWorkItemConfirmModal.show();
  }


  hideforwardWorkItemConfirmModal() {
    this.forwardWorkItemConfirmModal.hide();
  }

  saveInCsv() {
    var options = { 
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useHeader: true,
      headers: ["id", "description", "requesterDisplayName", "ownerDisplayName", "created", "state", "remediationItems", "approvalItems"],
      nullToEmptyString: true,
    };

    const currentUser = this.authenticationService.currentUserValue;
    let fileName = `${currentUser.tenant}-work-items-pending`;

    let arr = [];
    for (let each of this.pendingWorkItems) {
      let record = Object.assign(each);
      arr.push(record);
    }


    let angularCsv: AngularCsv = new AngularCsv(arr, fileName, options);
  }

}