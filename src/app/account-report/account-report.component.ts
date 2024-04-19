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
    console.log('Started Monitor');
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
        source.comment = '';
        if (each.connectorAttributes.user != null) {
          source.comment = 'user:' + each.connectorAttributes.user;
        }
        if (each.connectorAttributes.user != null) {
          source.comment = 'user:' + each.connectorAttributes.user;
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
      headers: ['name', 'accountSize', 'uncorrelated', 'entSize'],
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
