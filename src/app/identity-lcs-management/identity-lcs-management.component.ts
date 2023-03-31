import { Component, OnInit, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { IdentityProfile } from '../model/identity-profile';

@Component({
  selector: 'app-identity-lcs-management',
  templateUrl: './identity-lcs-management.component.html',
  styleUrls: ['./identity-lcs-management.component.css'],
})
export class IdentityLCSComponent implements OnInit {
  identityProfiles: IdentityProfile[];
  loading: boolean;
  validToSubmit: boolean;

  lcsAttributes: IdentityProfile[];
  selectedIdentityProfileId: string;
  lcsToDeleteId: string;
  identityProfileLCSExists: boolean;
  zip: JSZip = new JSZip();

  invalidMessage: string[];

  public modalRef: BsModalRef;

  @ViewChild('submitDeleteLCSSubmitConfirmModal', { static: false })
  submitDeleteLCSSubmitConfirmModal: ModalDirective;

  constructor(
    private idnService: IDNService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.reset(true);
    this.getAllIdentityProfiles();
  }

  reset(clearMsg: boolean) {
    this.loading = false;
    this.invalidMessage = [];
    this.validToSubmit = false;

    this.identityProfiles = null;
    this.lcsAttributes = null;
    this.selectedIdentityProfileId = null;
    this.identityProfileLCSExists = null;
    this.lcsToDeleteId = null;

    if (clearMsg) {
      this.messageService.clearAll();
    }
  }

  getAllIdentityProfiles() {
    this.loading = true;
    this.idnService.getAllIdentityProfiles().subscribe(allIdentityProfiles => {
      this.identityProfiles = [];
      for (const each of allIdentityProfiles) {
        const identityProfile = new IdentityProfile();
        identityProfile.id = each.id;
        identityProfile.name = each.name;

        this.identityProfiles.push(identityProfile);
      }

      this.loading = false;
    });
  }

  getIdentityProfileLCS(profileId: string) {
    if (profileId != null) {
      this.selectedIdentityProfileId = profileId;

      this.idnService
        .getIdentityProfileLCS(this.selectedIdentityProfileId)
        .subscribe(
          result => {
            this.identityProfileLCSExists = true;

            this.lcsAttributes = [];
            for (const each of result) {
              const lcsAttribute = new IdentityProfile();
              lcsAttribute.lcsId = each.id;
              lcsAttribute.lcsDisplayName = each.name;
              lcsAttribute.lcsTechnicalName = each.technicalName;
              lcsAttribute.lcsEnabled = each.enabled;
              lcsAttribute.lcsIdentityCount = each.identityCount;

              this.lcsAttributes.push(lcsAttribute);
            }
          },
          () => {
            this.identityProfileLCSExists = false;
          }
        );
    }
  }

  deleteLCS() {
    this.messageService.clearError();
    this.loading = true;

    this.idnService
      .deleteIdentityProfileLCS(
        this.selectedIdentityProfileId,
        this.lcsToDeleteId
      )
      .subscribe(
        () => {
          this.submitDeleteLCSSubmitConfirmModal.hide();
          this.reset(false);
          this.ngOnInit();
        },
        err => {
          this.messageService.handleIDNError(err);
          this.submitDeleteLCSSubmitConfirmModal.hide();
          this.reset(false);
          this.ngOnInit();
        }
      );
  }

  downloadLCS() {
    const identityProfile = new IdentityProfile();

    this.idnService
      .getIdentityProfile(this.selectedIdentityProfileId)
      .subscribe(
        result => {
          identityProfile.name = result.name;

          this.idnService
            .getIdentityProfileLCS(this.selectedIdentityProfileId)
            .subscribe(
              result => {
                result = JSON.stringify(result, null, 4);

                const blob = new Blob([result], { type: 'application/json' });
                const fileName = 'LCS - ' + identityProfile.name + '.json';
                saveAs(blob, fileName);
              },
              err => this.messageService.handleIDNError(err)
            );
        },
        err => this.messageService.handleIDNError(err)
      );
  }

  //  exportAllIdentityProfilesLCS() {

  //   this.idnService.getAllIdentityProfiles()
  //         .subscribe(
  //           results => {
  //           this.identityProfiles = [];
  //           for (const each of results) {
  //             const identityProfile = new IdentityProfile();

  //             identityProfile.name = each.name;
  //             identityProfile.id = each.id;

  //             this.idnService.getIdentityProfileLCS(identityProfile.id)
  //             .subscribe(
  //               result => {
  //                 result = JSON.stringify(result, null, 4);

  //                 const fileName = "LCS - " + identityProfile.name + ".json";
  //                 this.zip.file(`${fileName}`, result);

  //               },
  //               err => this.messageService.handleIDNError(err)
  //             );

  //           }
  //           const currentUser = this.authenticationService.currentUserValue;
  //           const zipFileName = `${currentUser.tenant}-identityprofiles-lcs.zip`;

  //          this.zip.generateAsync({type:"blob"}).then(function(content) {
  //             saveAs(content, zipFileName);
  //         });

  //         this.ngOnInit();

  //         });
  // }

  showDeleteLCSSubmitConfirmModal(lcsId: string) {
    this.messageService.clearError();
    this.validToSubmit = true;
    this.invalidMessage = [];

    if (this.validToSubmit) {
      this.lcsToDeleteId = lcsId;
      this.submitDeleteLCSSubmitConfirmModal.show();
    } else {
      this.submitDeleteLCSSubmitConfirmModal.show();
    }
  }

  hideDeleteLCSSubmitConfirmModal() {
    this.submitDeleteLCSSubmitConfirmModal.hide();
  }
}
