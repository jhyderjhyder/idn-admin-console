import { Component, OnInit, ViewChild } from '@angular/core';
import { OrgConfig } from '../model/org-config';
import { Papa } from 'ngx-papaparse';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SimpleQueryCondition } from '../model/simple-query-condition';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { AuthenticationService } from '../service/authentication-service.service';

@Component({
  selector: 'app-org-time',
  templateUrl: './org-time.component.html',
  styleUrls: ['./org-time.component.css']
})

export class OrgTimeComponent implements OnInit {
  loading: boolean;
  timezone: OrgConfig[];
  validtimezones: OrgConfig[];
  selectedOption: string;
  errorMessage: string;
  
  constructor(
    private idnService: IDNService, 
    private messageService: MessageService) {
  }

  @ViewChild('submitConfirmModal', { static: false }) submitConfirmModal: ModalDirective;

  ngOnInit() {
    this.reset(true);
    this.getOrgConfig();
    this.getValidTimeZones();
  }

  reset(clearMsg: boolean) {
    this.timezone = null;
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
            this.timezone = [];
            let timezone = new OrgConfig();
            timezone.orgName = results.orgName;
            timezone.timeZone = results.timeZone;

            this.timezone.push(timezone);
            this.loading = false;
            
          });
  }

  getValidTimeZones() {
    this.loading = true;
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

  showSubmitConfirmModal() {
    this.messageService.clearError();
    let selectedTimeZone = [];
    this.idnService.updateOrgTimeConfig(this.selectedOption)
          .subscribe(results => {
             this.reset(false);
             this.ngOnInit();
          },
          err => {
            this.errorMessage = "Error to submit the changes.";
            this.reset(false);
            this.ngOnInit();
          }
        );;
  }
}