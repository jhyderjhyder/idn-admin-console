import { Component, OnInit } from '@angular/core';
import { IDNService } from '../service/idn.service';
import { AccountTotals } from '../model/accountTotals';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';
import { AuthenticationService } from '../service/authentication-service.service';

@Component({
  selector: 'app-account-report',
  templateUrl: './account-report.component.html',
  styleUrls: ['./account-report.component.css'],
})
export class AccountReportComponent implements OnInit {
  sources: AccountTotals[];
  allSources: any;
  sourceCount: number;

  constructor(
    private idnService: IDNService,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit() {
    this.sources = [];
    //this.getStatus();
    this.query();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  query() {
    this.idnService.getAllSources().subscribe(async allSources => {
      this.sources = [];
      this.sourceCount = allSources.length;
      this.allSources = allSources;

      //Sort it alphabetically
      allSources.sort((a, b) => a.name.localeCompare(b.name));

      let index = 0;
      for (const each of allSources) {
        if (index > 0 && index % 3 == 0) {
          // After processing every batch (10 sources), wait for 1 second before calling another API to avoid 429
          // Too Many Requests Error
          await this.sleep(1000);
        }
        index++;

        const source = new AccountTotals();
        source.id = each.id;
        source.name = each.name;
        source.serviceAccount = '';
        source.type = each.type;
        if (each.connectorAttributes.user != null) {
          source.serviceAccount = 'user:' + each.connectorAttributes.user;
        }

        if (each.connectorAttributes.clientID != null) {
          source.serviceAccount =
            'clientID:' + each.connectorAttributes.clientID;
        }

        if (each.connectorAttributes.client_id != null) {
          source.serviceAccount =
            'client_id:' + each.connectorAttributes.client_id;
        }

        if (each.connectorAttributes.forestSettings) {
          source.serviceAccount =
            'forestSetting:' + each.connectorAttributes.forestSettings[0].user;
        }
        if (each.connectorAttributes.genericWebServiceBaseUrl) {
          source.url = each.connectorAttributes.genericWebServiceBaseUrl;
        }

        if (each.connectorAttributes.host) {
          source.url = each.connectorAttributes.host;
        }

        if (
          each['connectorAttributes']['jco.client.mshost'] &&
          each['connectorAttributes']['jco.client.mshost'] != null
        ) {
          if (source.url != '') {
            source.url = source.url + ' | ';
          }
          source.url =
            source.url +
            'mshost:' +
            each['connectorAttributes']['jco.client.mshost'];
        }

        /**
         * Lets get the accounts
         */

        this.idnService
          .countApplicationAccounts(each.id, false)
          .subscribe(response => {
            const headers = response.headers;
            source.accountSize = headers.get('X-Total-Count');
          });
        this.idnService
          .countApplicationAccounts(each.id, true)
          .subscribe(response => {
            const headers = response.headers;
            source.uncorrelated = headers.get('X-Total-Count');
          });
        this.idnService.countEntitlements(each.id).subscribe(response => {
          const headers = response.headers;
          source.entSize = headers.get('X-Total-Count');
        });

        this.sources.push(source);
      }
    });
  }

  saveInCsv() {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useHeader: true,
      headers: [
        'name',
        'accountSize',
        'uncorrelated',
        'entSize',
        'serviceAccount',
        'type',
        'url',
      ],
      nullToEmptyString: true,
    };

    const currentUser = this.authenticationService.currentUserValue;
    const fileName = `${currentUser.tenant}-Account_Count`;

    const arr = [];
    for (const each of this.sources) {
      const record = Object.assign(each);
      arr.push(record);
    }

    new AngularCsv(arr, fileName, options);
  }
}
