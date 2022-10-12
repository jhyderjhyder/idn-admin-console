import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';
import { Papa } from 'ngx-papaparse';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import cron from 'cron-validate'
import { Source } from '../model/source';
import { Schedule } from '../model/schedule';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { AuthenticationService } from '../service/authentication-service.service';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-source-create-profile',
  templateUrl: './source-create-profile.component.html',
  styleUrls: ['./source-create-profile.component.css']
})

export class SourceCreateProfileComponent implements OnInit {

  sources: Source[];
  loading: boolean;
  validToSubmit: boolean;

  createProfileAttributes: string[];
  selectedCreateProfileAttribute: string;
  newCreateProfileAttribute: string;
  selectedSourceID: string;
  createProfileExists: boolean;
  selectedSourceName: string;
  zip: JSZip = new JSZip();

  invalidMessage: string[];

  public modalRef: BsModalRef;
  
  @ViewChild('submitAddAttributeSubmitConfirmModal', { static: false }) submitAddAttributeSubmitConfirmModal: ModalDirective;
  @ViewChild('submitDeleteAttributeSubmitConfirmModal', { static: false }) submitDeleteAttributeSubmitConfirmModal: ModalDirective;

  @ViewChild('fileInput', {static: false}) fileInput: ElementRef;

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
   
    this.loading = false;
    this.invalidMessage = [];

    this.selectedCreateProfileAttribute = null;
    this.newCreateProfileAttribute = null;
    this.selectedSourceID = null;
    this.createProfileExists = null;

    if (clearMsg) {
      this.messageService.clearAll();

    } 
  }

  search() {
    this.loading = true;
    this.idnService.getAllSources()
          .subscribe(allSources => {

            this.sources = [];
            for (let each of allSources) {
              let source = new Source();
              source.id = each.id;
              source.name = each.name;

              this.sources.push(source);
            }
            this.sources.sort(function (a, b) {
              return a.name.localeCompare(b.name);
          });

            this.loading = false;
          });
  }


  getSourceCreateProfile(sourceId: string){
    if (sourceId != null) {

      this.selectedSourceID = sourceId;
    
      this.idnService.getSourceCreateProfile(this.selectedSourceID)
      .subscribe(result => {
        this.createProfileExists = true;
        this.createProfileAttributes = result.fields;
  
      },
      err => {
        this.createProfileExists = false;

      });  
      
    }


  }

  createAttribute(){
    this.messageService.clearError();
    this.loading = true;

    if (!this.createProfileExists) {
      this.idnService.createSourceCreateProfile(this.selectedSourceID, this.newCreateProfileAttribute)
      .subscribe(results => {
         this.submitAddAttributeSubmitConfirmModal.hide();
         this.reset(false);
         this.getSourceCreateProfile(this.selectedSourceID);
      },
      err => {
        this.messageService.handleIDNError(err);
        this.submitAddAttributeSubmitConfirmModal.hide();
        this.reset(false);
        this.ngOnInit();
      }
    );;

    }else {
      this.idnService.createSourceCreateProfileAttribute(this.selectedSourceID, this.newCreateProfileAttribute)
        .subscribe(results => {
            this.submitAddAttributeSubmitConfirmModal.hide();
            this.reset(false);
            this.getSourceCreateProfile(this.selectedSourceID);
        },
        err => {
          this.messageService.handleIDNError(err);
          this.submitAddAttributeSubmitConfirmModal.hide();
          this.reset(false);
          this.ngOnInit();
        }
      );;
    }


  }

  deleteAttribute(){
    this.messageService.clearError();
    this.loading = true;

   let attrIndex = this.createProfileAttributes.findIndex(result => result === this.selectedCreateProfileAttribute);
    
    this.idnService.deleteSourceCreateProfileAttribute(this.selectedSourceID, attrIndex)
          .subscribe(results => {
            this.submitDeleteAttributeSubmitConfirmModal.hide();
             this.reset(false);
             this.ngOnInit();
          },
          err => {
            this.messageService.handleIDNError(err);
            this.submitDeleteAttributeSubmitConfirmModal.hide();
            this.reset(false);
            this.ngOnInit();
          }
        );;
  }


  // exportAllCreateProfiles() {
  
  //   for (let each of this.sources) {
  //     this.idnService.getSourceCreateProfile(each.id)
  //     .subscribe(
  //       result => {
  //         result = JSON.stringify(result, null, 4);
          
  //         var blob = new Blob([result], {type: "application/json"});
  //         let fileName = "Source - CREATE - " + each.name + ".json";
  //         this.zip.file(`${fileName}`, blob);
    
  //       });
    
  //   }

  //   const currentUser = this.authenticationService.currentUserValue;
  //   let zipFileName = `${currentUser.tenant}-source-create-profile.zip`;
    
  //   this.zip.generateAsync({type:"blob"}).then(function(content) {
  //     saveAs(content, zipFileName);

  // });

  // }

 downloadCreateProfile() {

  let source = new Source();

  this.idnService.getSource(this.selectedSourceID)
  .subscribe(
    result => {
       source.name = result.name;

       this.idnService.getSourceCreateProfile(this.selectedSourceID)
       .subscribe(
         result => {
           result = JSON.stringify(result, null, 4);
           
           var blob = new Blob([result], {type: "application/json"});
           let fileName = "Source - CREATE - " + source.name + ".json";
           saveAs(blob, fileName);
     
         },
         err => this.messageService.handleIDNError(err)
       );

    },
    err => this.messageService.handleIDNError(err)
  );
 }

  showAddAttributeSubmitConfirmModal(): void {
    this.messageService.clearError();
    this.validToSubmit = true;
    this.invalidMessage = [];

    if (!this.newCreateProfileAttribute) {
      this.invalidMessage.push(`Must type an attribute name`);
      this.validToSubmit = false;
    }

    if (this.validToSubmit) {
      this.submitAddAttributeSubmitConfirmModal.show();
    } else {
      this.submitAddAttributeSubmitConfirmModal.show();
    }
  }

  showDeleteAttributeSubmitConfirmModal() {
    this.messageService.clearError();
    this.validToSubmit = true;
    this.invalidMessage = [];

    if (!this.selectedCreateProfileAttribute) {
      this.invalidMessage.push(`Must select an attribute to delete`);
      this.validToSubmit = false;
    }

    if (this.validToSubmit) {
      this.submitDeleteAttributeSubmitConfirmModal.show();
    } else {
      this.submitDeleteAttributeSubmitConfirmModal.show();
    }
  }

  hideAddAttributeSubmitConfirmModal() {
    this.submitAddAttributeSubmitConfirmModal.hide();
  }

  hideDeleteAttributeSubmitConfirmModal() {
    this.submitDeleteAttributeSubmitConfirmModal.hide();
  }
}

