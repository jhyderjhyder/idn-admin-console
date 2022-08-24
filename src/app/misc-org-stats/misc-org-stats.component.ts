import { Component, OnInit, ViewChild } from '@angular/core';
import { OrgData } from '../model/org-data';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';

@Component({
  selector: 'app-misc-org-stats',
  templateUrl: './misc-org-stats.component.html',
  styleUrls: ['./misc-org-stats.component.css']
})

export class OrgStatsComponent implements OnInit {
  loading: boolean;
  orgData: OrgData;
  selectedOption: string;
  errorMessage: string;
  validToSubmit: boolean;
  invalidMessage: string[];
  
  constructor(
    private idnService: IDNService, 
    private messageService: MessageService) {
  }

  ngOnInit() {
    this.reset(true);
    this.getOrgData();
  }

  reset(clearMsg: boolean) {
    this.orgData = null;
    this.loading = false;
    if (clearMsg) {
      this.messageService.clearAll();
      this.errorMessage = null;
    } 
  }

  getOrgData() {
    this.loading = true;
    this.idnService.getHostingData()
          .subscribe(
            result => {
              this.orgData = new OrgData();
              this.orgData.orgName = result.org;
              this.orgData.orgRegion = result.region;
              this.orgData.orgPod = result.pod;
              this.orgData.orgLayer = result.layer;
          });

    this.idnService.getOrgConfig()
    .subscribe(
      results => {
        this.orgData.currentTimeZone = results.timeZone;

    });

    this.idnService.getAccountCount()
          .subscribe(
            result => {
              this.orgData.accountCount = result.headers.get('X-Total-Count')

          });

    this.idnService.getIdentityProfileCount()
    .subscribe(
      result => {
        this.orgData.identityProfileCount = result.headers.get('X-Total-Count')

    });

    this.idnService.getIdentityCount()
    .subscribe(
      result => {
        this.orgData.identityCount = result.headers.get('X-Total-Count')

    });

    this.idnService.getSourceCount()
    .subscribe(
      result => {
        this.orgData.sourceCount = result.headers.get('X-Total-Count')

    });

    this.idnService.getAccessProfileCount()
    .subscribe(
      result => {
        this.orgData.accessProfileCount = result.headers.get('X-Total-Count')

    });

    this.idnService.getRoleCount()
    .subscribe(
      result => {
        this.orgData.roleCount = result.headers.get('X-Total-Count')

    });

    this.idnService.getEntitlementCount()
    .subscribe(
      result => {
        this.orgData.entitlementCount = result.headers.get('X-Total-Count')

    });

    this.idnService.getTotalCampaignCount()
    .subscribe(
      result => {
        this.orgData.totalCampaignCount = result.headers.get('X-Total-Count')

    });

    this.idnService.getActiveCampaignCount()
    .subscribe(
      result => {
        this.orgData.activeCampaignCount = result.headers.get('X-Total-Count')

    });

    this.idnService.getCompletedCampaignCount()
    .subscribe(
      result => {
        this.orgData.completedCampaignCount = result.headers.get('X-Total-Count')

    });

    this.idnService.getPasswordChangeCount()
    .subscribe(
      result => {
        this.orgData.passwordChangeCount = result.headers.get('X-Total-Count')

    });

    this.idnService.getProvisioningActivityCount()
    .subscribe(
      result => {
        this.orgData.provisioningActivityCount = result.headers.get('X-Total-Count')

    });

    this.loading = false;

  }



}