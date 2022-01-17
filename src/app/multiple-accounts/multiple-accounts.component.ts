import { Component, OnInit } from '@angular/core';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';
import { Account } from '../model/account';
import { IDNService } from '../service/idn.service';
import { AuthenticationService } from '../service/authentication-service.service';

@Component({
  selector: 'app-multiple-accounts',
  templateUrl: './multiple-accounts.component.html',
  styleUrls: ['./multiple-accounts.component.css']
})
export class MultipleAccountsComponent implements OnInit {
  accounts: Account[];
  errorMessage: string;
  searchText: string;

  constructor(private idnService: IDNService, 
    private authenticationService: AuthenticationService) { }

  ngOnInit() {
    this.reset();
    this.search();
  }

  reset() {
    this.accounts = null;
    this.searchText = null;
    this.errorMessage = null;
  }

  search() {
    this.idnService.searchMultipleAccounts()
          .subscribe(searchResult => {
            this.accounts = [];
            let accnts = searchResult.aggregations.accounts.source_id.buckets.filter(each => each.identities.buckets.length > 0);

            for (let acc of accnts) {
              for (let bucket of acc.identities.buckets) {
                let identityId = bucket.key.replace("identity#", "");

                this.idnService.searchIdentities(identityId)
                  .subscribe(searchResult => { 
                    let identityName: string;
                    let identityDisplayName: string;
                    let identityFirstName: string;
                    let identityLastName: string;
                    let email: string;
                    let inactive: boolean;

                    let records = searchResult;
                    for (let rec of records) {
                      identityName = rec.name;
                      identityDisplayName = rec.displayName;
                      identityFirstName = rec.firstName;
                      identityLastName = rec.lastName;
                      email = rec.email;
                      inactive = rec.inactive;
                    }
                    
                    for (let hit of bucket.accounts.hits.hits) {
                      let account = new Account();
                      //Account level fields
                      account.accountId = hit._source.accountId;
                      account.accountName = hit._source.name;
                      account.sourceId = hit._source.source.id;
                      account.sourceName = hit._source.source.name;
                      account.accountDisabled = hit._source.disabled;
                      account.accountCreated = hit._source.created;
                      //Identity level fields
                      account.identityId = identityId;
                      account.identityName = identityName;
                      account.displayName = identityDisplayName;
                      account.firstName = identityFirstName;
                      account.lastName = identityLastName;
                      account.email = email;
                      account.inactive = inactive;

                      this.accounts.push(account);
                    }
                });
              }
            }
          });
  }

  saveInCsv() {
    var options = { 
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useHeader: true,
      headers: ["identityName", "displayName", "inactive", "sourceName", "accountId", "accountName", "accountDisabled", "accountCreated"],
      nullToEmptyString: true,
    };

    const currentUser = this.authenticationService.currentUserValue;
    let fileName = `${currentUser.tenant}-Multiple-Accounts`;

    let arr = [];
    for (let each of this.accounts) {
      let record = Object.assign(each);
      if (each.inactive) {
        record.inactive = "Yes";
      } else {
        record.inactive = "No";
      }
      if (each.accountDisabled) {
        record.accountDisabled = "Yes";
      } else {
        record.accountDisabled = "No";
      }
      arr.push(record);
    }

    let angularCsv: AngularCsv = new AngularCsv(arr, fileName, options);
  }

}
