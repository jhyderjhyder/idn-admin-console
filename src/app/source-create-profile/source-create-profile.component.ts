import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Source } from '../model/source';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { AuthenticationService } from '../service/authentication-service.service';

@Component({
  selector: 'app-source-create-profile',
  templateUrl: './source-create-profile.component.html',
  styleUrls: ['./source-create-profile.component.css'],
})
export class SourceCreateProfileComponent implements OnInit {
  sources: Source[];
  loading: boolean;
  validToSubmit: boolean;
  exporting: boolean;

  createProfileAttributes: string[];
  selectedCreateProfileAttribute: string;
  newCreateProfileAttribute: string;
  selectedSourceID: string;
  createProfileExists: boolean;
  selectedSourceName: string;
  zip: JSZip = new JSZip();

  invalidMessage: string[];

  public modalRef: BsModalRef;

  @ViewChild('submitAddAttributeSubmitConfirmModal', { static: false })
  submitAddAttributeSubmitConfirmModal: ModalDirective;
  @ViewChild('submitDeleteAttributeSubmitConfirmModal', { static: false })
  submitDeleteAttributeSubmitConfirmModal: ModalDirective;

  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  constructor(
    private idnService: IDNService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService
  ) {}

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
    this.exporting = false;

    if (clearMsg) {
      this.messageService.clearAll();
    }
  }

  search() {
    this.loading = true;
    this.idnService.getAllSources().subscribe(allSources => {
      this.sources = [];
      for (const each of allSources) {
        const source = new Source();
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

  getSourceCreateProfile(sourceId: string) {
    if (sourceId != null) {
      this.selectedSourceID = sourceId;

      this.idnService.getSourceCreateProfile(this.selectedSourceID).subscribe(
        result => {
          this.createProfileExists = true;
          this.createProfileAttributes = result.fields;
        },
        () => {
          this.createProfileExists = false;
        }
      );
    }
  }

  createAttribute() {
    this.messageService.clearError();
    this.loading = true;

    if (!this.createProfileExists) {
      this.idnService
        .createSourceCreateProfile(
          this.selectedSourceID,
          this.newCreateProfileAttribute
        )
        .subscribe(
          () => {
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
        );
    } else {
      this.idnService
        .createSourceCreateProfileAttribute(
          this.selectedSourceID,
          this.newCreateProfileAttribute
        )
        .subscribe(
          () => {
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
        );
    }
  }

  deleteAttribute() {
    this.messageService.clearError();
    this.loading = true;

    const attrIndex = this.createProfileAttributes.findIndex(
      result => result === this.selectedCreateProfileAttribute
    );

    this.idnService
      .deleteSourceCreateProfileAttribute(this.selectedSourceID, attrIndex)
      .subscribe(
        () => {
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
      );
  }

  exportAllSourcesCreateProfiles() {
    this.exporting = true;
    this.idnService.getAllSources().subscribe(
      results => {
        this.sources = [];
        const promises = [];

        for (let i = 0; i < results.length; i++) {
          const each = results[i];
          const source = new Source();
          source.name = each.name;
          source.id = each.id;

          const promise = this.idnService
            .getSourceCreateProfile(source.id)
            .toPromise()
            .then(
              result => {
                result = JSON.stringify(result, null, 4);
                const fileName = 'Source - CREATE - ' + source.name + '.json';
                this.zip.file(`${fileName}`, result);
              },
              err => {
                if (err.status === 404) {
                  console.log(
                    `No create profile found for Source ${source.name}`
                  );
                } else {
                  this.messageService.handleIDNError(err);
                }
              }
            );
          promises.push(promise);

          // add 3 second delay after every 10 calls to avoid 429 retry error
          if ((i + 1) % 10 === 0) {
            promises.push(new Promise(resolve => setTimeout(resolve, 3000)));
          }
        }

        Promise.all(promises).then(() => {
          const currentUser = this.authenticationService.currentUserValue;
          const zipFileName = `${currentUser.tenant}-sources-create-profile.zip`;
          this.zip.generateAsync({ type: 'blob' }).then(content => {
            saveAs(content, zipFileName);
          });
          this.ngOnInit();
        });
      },
      err => this.messageService.handleIDNError(err)
    );
  }

  downloadCreateProfile() {
    const source = new Source();

    this.idnService.getSource(this.selectedSourceID).subscribe(
      result => {
        source.name = result.name;

        this.idnService.getSourceCreateProfile(this.selectedSourceID).subscribe(
          result => {
            result = JSON.stringify(result, null, 4);

            const blob = new Blob([result], { type: 'application/json' });
            const fileName = 'Source - CREATE - ' + source.name + '.json';
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
