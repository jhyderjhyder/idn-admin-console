import { Component, OnInit, ViewChild } from '@angular/core';
import { OrgConfig } from '../model/org-config';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';

@Component({
  selector: 'app-misc-org-time-update',
  templateUrl: './misc-org-time-update.component.html',
  styleUrls: ['./misc-org-time-update.component.css']
})

export class OrgTimeComponent implements OnInit {
  loading: boolean;
  orgConfig: OrgConfig;
  validtimezones: OrgConfig[];
  selectedOption: string;
  errorMessage: string;
  validToSubmit: boolean;
  invalidMessage: string[];
  
  constructor(
    private idnService: IDNService, 
    private messageService: MessageService) {
  }

  @ViewChild('submitConfirmModal', { static: false }) submitConfirmModal: ModalDirective;

  ngOnInit() {
    this.reset(true);
    this.getOrgConfig();
  }

  reset(clearMsg: boolean) {
    this.orgConfig = null;
    this.loading = false;
    if (clearMsg) {
      this.messageService.clearAll();
      this.errorMessage = null;
    } 
  }

  closeModalDisplayMsg() {
    if (this.errorMessage != null) {
      this.messageService.setError(this.errorMessage);
    } else {
      this.messageService.add("Changes saved successfully.");
    }
    this.submitConfirmModal.hide();
  }

  getOrgConfig() {
    this.loading = true;
    this.idnService.getOrgConfig()
          .subscribe(
            results => {
              this.orgConfig = new OrgConfig();
              this.orgConfig.orgName = results.orgName;
              this.orgConfig.currentTimeZone = results.timeZone;

          });

    this.idnService.getValidTimeZones()
          .subscribe(
            results => {
              results.sort(function(a, b) {
              return a.localeCompare(b);
          });

          this.validtimezones = results;

          this.loading = false;
          });

  }

  updateOrgTimeZone() {
    this.messageService.clearError();
    this.validToSubmit = true;
    this.loading = true;
    
    this.idnService.updateOrgTimeConfig(this.selectedOption)
          .subscribe(results => {
            this.closeModalDisplayMsg();
             this.reset(false);
             this.ngOnInit();
          },
          err => {
            this.errorMessage = "Error to submit the changes.";
            this.closeModalDisplayMsg();
            this.reset(false);
            this.ngOnInit();
          }
        );;


  }

  showSubmitConfirmModal() {
    this.messageService.clearError();
    this.validToSubmit = true;
    this.loading = true;
    this.invalidMessage = [];
    if (!this.selectedOption) {
      this.invalidMessage.push(`Must select a timezone from dropdown list`);
      this.validToSubmit = false;
    }
    else if (this.orgConfig.currentTimeZone == this.selectedOption) {
      this.invalidMessage.push(`Selected Timezone ${this.selectedOption} is not changed.`);
      this.validToSubmit = false;
    }

    if (this.validToSubmit) {
      this.submitConfirmModal.show();
  } else {
    this.submitConfirmModal.show();
  }
}

  hideSubmitConfirmModal() {
    this.submitConfirmModal.hide();
    this.ngOnInit();
  }

}