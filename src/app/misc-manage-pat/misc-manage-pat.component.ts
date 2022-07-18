import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Papa } from 'ngx-papaparse';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { AuthenticationService } from '../service/authentication-service.service';
import { PAT } from '../model/pat';
import { SimpleQueryCondition } from '../model/simple-query-condition';

@Component({
  selector: 'app-misc-manage-pat',
  templateUrl: './misc-manage-pat.component.html',
  styleUrls: ['./misc-manage-pat.component.css']
})
export class ManagePATComponent implements OnInit {
  pats: PAT[];
  errorInvokeApi: boolean;
  searchText: string;
  loading: boolean;

  PATToDelete: PAT;
  validToSubmit: boolean;
  deletePATNameText: string;

  invalidMessage: string[];

  public modalRef: BsModalRef;
  
  @ViewChild('deletePATConfirmModal', { static: false }) deletePATConfirmModal: ModalDirective;


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
    this.pats = null;
    this.searchText = null;
    this.loading = false;
    this.PATToDelete = null;
    this.validToSubmit = null;
    this.deletePATNameText = null;
    this.invalidMessage = [];
    if (clearMsg) {
      this.messageService.clearAll();
      this.errorInvokeApi = false;
    } 
  }

  search() {
    this.loading = true;
    this.idnService.listPAT()
          .subscribe(allPATs => {
            this.pats = [];
            for (let each of allPATs) {
              let pat = new PAT();
              pat.id = each.id;
              pat.name = each.name;
              pat.scope = each.scope;
              pat.created = each.created;    

              let query = new SimpleQueryCondition();
              query.attribute = "id";
              query.value = each.owner.id;

              this.idnService.searchAccounts(query)
                .subscribe(searchResult => { 
                  if (searchResult.length > 0) {
                    pat.ownerId = searchResult[0].id;
                    pat.ownerAccountName = searchResult[0].name;
                    pat.ownerDisplayName = searchResult[0].displayName;
                  }
              }); 

              this.idnService.getUserByAlias(each.owner.name)
              .subscribe( userDetail => {
                pat.orgPermission = userDetail.role;
              })

              this.pats.push(pat);
            }
            this.loading = false;
          });
  }

  deletePAT() {
    this.messageService.clearAll();
    this.invalidMessage = [];
    // validation
    if (this.deletePATNameText != this.PATToDelete.id) {
      this.invalidMessage.push("Confirmed PAT ID does not match chosen PAT ID!");
      this.validToSubmit = false;
      return;
    }
    else {
      this.validToSubmit = true;
    }


    this.idnService.deletePAT(this.PATToDelete)
      .subscribe(
        result => {
          //this.closeModalDisplayMsg();
          this.deletePATConfirmModal.hide();
          this.messageService.add("PAT Deleted");
          this.PATToDelete = null;
          this.reset(false);
          this.search();
        },
        err => {
          this.deletePATConfirmModal.hide();
          this.PATToDelete = null;
          this.messageService.handleIDNError(err);
        }
      );

  }


  showDeletePATConfirmModal(selectedPAT: PAT) {
    this.invalidMessage = [];
    this.deletePATNameText = null;
    this.PATToDelete = new PAT();
    this.PATToDelete.id = selectedPAT.id;
    this.PATToDelete.name = selectedPAT.name;
    this.PATToDelete.ownerAccountName = selectedPAT.ownerAccountName;
    this.validToSubmit = false;
    this.deletePATConfirmModal.show();

  }

  hidedeletePATConfirmModal() {
    this.deletePATConfirmModal.hide();
  }

}
