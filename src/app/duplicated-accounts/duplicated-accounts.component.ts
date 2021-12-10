import { Component, OnInit } from '@angular/core';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';
import { AccountSearchCondition } from '../model/accountSearchCondition';
import { Account } from '../model/account';
import { IDNService } from '../service/idn.service';

@Component({
  selector: 'app-duplicated-accounts',
  templateUrl: './duplicated-accounts.component.html',
  styleUrls: ['./duplicated-accounts.component.css']
})
export class DuplicatedAccountsComponent implements OnInit {
  accountSearchCondition: AccountSearchCondition;
  accounts: Account[];
  errorMessage: string;
  searchText: string;

  constructor(private idnService: IDNService) { }

  ngOnInit() {
    this.reset();
  }

  reset() {
    this.accountSearchCondition = new AccountSearchCondition();
    this.accounts = null;
    this.errorMessage = null;
  }

  search() {
    this.idnService.searchDuplicatedAccounts()
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

    let angularCsv: AngularCsv = new AngularCsv(this.accounts, 'DuplicatedAccounts', options);
  }

}
