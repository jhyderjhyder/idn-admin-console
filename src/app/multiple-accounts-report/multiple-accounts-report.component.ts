import { Component, OnInit } from '@angular/core';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';
import { Account } from '../model/account';
import { IDNService } from '../service/idn.service';
import { AuthenticationService } from '../service/authentication-service.service';
import { MessageService } from '../service/message.service';
import { bufferCount, catchError, concatMap, delay, map, mergeMap, retryWhen } from 'rxjs/operators';
import { from, forkJoin, throwError, of } from 'rxjs';

@Component({
  selector: 'app-multiple-accounts-report',
  templateUrl: './multiple-accounts-report.component.html',
  styleUrls: ['./multiple-accounts-report.component.css']
})
export class MultipleAccountsComponent implements OnInit {
  accounts: Account[];
  errorMessage: string;
  searchText: string;
  loading: boolean;
  totalCount: number;

  constructor(private idnService: IDNService, 
    private authenticationService: AuthenticationService,
    private messageService: MessageService) { }

  ngOnInit() {
    this.reset();
    this.search();
  }

  reset() {
    this.accounts = null;
    this.searchText = null;
    this.errorMessage = null;
    this.loading = false;
    this.messageService.clearAll();
  }

  search() {
   this.loading = true;

   this.accounts = [];
   this.totalCount = 0;

    this.idnService.searchMultipleAccounts().pipe(
      map(searchResults => searchResults.aggregations.accounts.source_id.buckets.filter(each => each.identities.buckets.length > 0)),
      map(accnts => { if (accnts.length == 0) { this.messageService.add("No Multiple Accounts Found"); return []; } else return [].concat.apply([], accnts.map(acc => acc.identities.buckets)) }),
      mergeMap(buckets => from(buckets)),
      bufferCount<any>(10),
      concatMap(bucketsBuffer => forkJoin(bucketsBuffer.map(bucket => this.searchIdentitiesWithRetry(bucket.key.replace("identity#", "")).pipe(delay(1000), map(rec => ({rec, bucket}))))))
    ).subscribe({next: searchResult => {
        let identityName: string;
        let identityDisplayName: string;
        
            for (let result of searchResult) {
                for (let rec of result.rec) {  
                    identityName = rec.name;
                    identityDisplayName = rec.displayName;
                }

                for (let hit of result.bucket.accounts.hits.hits) {
                    let account = new Account();
                    //Account level fields
                    account.accountId = hit._source.accountId;
                    account.accountName = hit._source.name;
                    account.sourceId = hit._source.source.id;
                    account.sourceName = hit._source.source.name;
                    account.accountDisabled = hit._source.disabled;
                    account.accountCreated = hit._source.created;
                    //Identity level fields
                    account.identityName = identityName;
                    account.displayName = identityDisplayName;
                    
                    this.accounts.push(account);
                }
            }
            this.totalCount = this.accounts.length;
        },
        complete: () => this.loading = false});
  }

  searchIdentitiesWithRetry(search) {
    return this.idnService.searchIdentities(search).pipe(
      catchError(err => {
        return throwError(err);
      }),
      retryWhen(obs => obs.pipe(
        concatMap(response => {
          if (response.status === 429) {
            return of(response).pipe(delay(5000))
          } else {
            return throwError(response);
          }
        })
      ))
    )
  }

  saveInCsv() {
    var options = { 
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useHeader: true,
      headers: ["identityName", "displayName", "sourceName", "accountId", "accountName", "accountDisabled", "accountCreated"],
      nullToEmptyString: true,
    };

    const currentUser = this.authenticationService.currentUserValue;
    let fileName = `${currentUser.tenant}-multiple-accounts`;

    let arr = [];
    for (let each of this.accounts) {
      let record = Object.assign(each);
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