import { Component, OnInit } from '@angular/core';
import { SimpleQueryCondition } from '../model/simple-query-condition';
import { DeltaRemoved, SimpleCompare } from '../model/SimpleCompare';
import { IDNService } from '../service/idn.service';

@Component({
    selector: 'app-identity-compare',
    templateUrl: './identity-compare.component.html',
    styleUrls: ['./identity-compare.component.css'],
    standalone: false
})
export class IdentityCompareComponent implements OnInit {
  master: string;
  masterAppCount: number;
  masterEntCount: number;
  clone: string;
  cloneEntCount: number;
  cloneAppCount: number;
  deltaAppCount: number;
  deltaRemovedEntries: number;
  cloneLoading: boolean;
  masterLoading: boolean;
  valueDisplayed: string;
  valueMasterUser: string;
  valueCloneUser: string;

  masterDetails: Array<SimpleCompare>;
  cloneDetails: Array<SimpleCompare>;

  delta: Array<SimpleCompare>;
  deltaString: Array<DeltaRemoved>;

  constructor(private idnService: IDNService) {}
  ngOnInit() {
    this.reset();
  }

  reset() {
    this.cloneLoading = true;
    this.masterLoading = true;
    this.masterDetails = new Array<SimpleCompare>();
    this.cloneDetails = new Array<SimpleCompare>();
    this.delta = new Array<SimpleCompare>();
    this.deltaString = null;
    this.cloneEntCount = 0;
    this.cloneAppCount = 0;
    this.masterAppCount = 0;
    this.masterEntCount = 0;
    this.deltaAppCount = 0;
    this.deltaRemovedEntries = 0;
    this.valueMasterUser = '';
    this.valueCloneUser = '';
    this.valueDisplayed = null;
  }

  /*
   * Fetch the data from IdentityNow
   * this loads up the data to do the
   * compair, I might add this as a promise
   * in time.
   */
  submit() {
    this.reset();
    const query = new SimpleQueryCondition();
    query.attribute = 'name';
    query.value = this.master;

    this.idnService.searchAccounts(query).subscribe(searchResult => {
      if (searchResult.length > 0) {
        const m = searchResult[0];
        this.valueMasterUser = m.displayName;
        if (m.accounts) {
          for (let i = 0; i < m.accounts.length; i++) {
            const c = this.stringAccess(m.accounts[i], true);
            this.masterDetails.push(c);
            //console.table(c);
          }
        }
        this.masterLoading = false;
        this.delta = structuredClone(this.masterDetails);
        this.valueDisplayed = 'All of [' + this.valueMasterUser + '] Access';

        this.delta.sort((a, b) =>
          a.applicationName.localeCompare(b.applicationName)
        );
        for (let i = 0; i < this.delta.length; i++) {
          this.delta[i].simpleName.sort();
        }
      }
    });

    query.value = this.clone;
    //query.value = '35291203';
    this.idnService.searchAccounts(query).subscribe(searchResult => {
      if (searchResult.length > 0) {
        const m = searchResult[0];
        this.valueCloneUser = m.displayName;
        if (m.accounts) {
          for (let i = 0; i < m.accounts.length; i++) {
            const c = this.stringAccess(m.accounts[i], false);
            this.cloneDetails.push(c);
          }
        }
        this.cloneLoading = false;
      }
    });
  }

  compare() {
    this.deltaString = new Array<DeltaRemoved>();
    this.delta = structuredClone(this.masterDetails);

    for (let i = 0; i < this.cloneDetails.length; i++) {
      const item = this.cloneDetails[i];
      const appName = item.applicationName;

      for (let y = 0; y < item.simpleName.length; y++) {
        const sname = item.simpleName[y];
        this.removeEntry(sname, appName);
      }
    }
    this.valueDisplayed = 'Access You might want to request';

    this.delta.sort((a, b) =>
      a.applicationName.localeCompare(b.applicationName)
    );

    /*
    this.delta.forEach( function (value){
      console.log(value);
    });
    */
  }

  /*
   * Child of compare that removes entries from the delta.
   */
  removeEntry(entitlement, application) {
    for (let x = 0; x < this.delta.length; x++) {
      const deltaItem = this.delta[x];
      if (deltaItem.applicationName === application) {
        this.deltaAppCount++;
        const update = new Array<String>();
        for (let y = 0; y < deltaItem.simpleName.length; y++) {
          const valuedelta = deltaItem.simpleName[y];
          if (valuedelta === entitlement) {
            const removed = new DeltaRemoved();
            const split = entitlement.split('::');
            removed.applicationName = application;
            removed.entName = split[1];
            removed.entType = split[0];
            this.deltaString.push(removed);
            this.deltaRemovedEntries++;
          } else {
            update.push(valuedelta.toString());
          }
        }
        /*  forEach not threadsafe?   
        deltaItem.simpleName.forEach(function (valuedelta){
              if (valuedelta===entitlement){
                remove =true;
              }else{
                update.push(valuedelta.toString());
              }
            });
            */
        deltaItem.simpleName = update;
        this.delta[x] = deltaItem;
      }
    }
  }

  /*
Child of submit function as this lets us pull two users records 
should convert this to return but for now I am only doing to users
simple enough...
* Get the users data and convert into simple string
* so we can use later to compair the data
*/
  stringAccess(account, first) {
    const c = new SimpleCompare();
    c.simpleName = new Array<String>();
    if (account.source) {
      c.applicationName = account.source.name;
      if (first === true) {
        this.masterAppCount++;
      } else {
        this.cloneAppCount++;
      }
    }

    for (const key in account.entitlementAttributes) {
      if (key) {
        const subItem = account.entitlementAttributes[key];
        if (Array.isArray(subItem)) {
          for (const child in subItem) {
            if (child) {
              c.simpleName.push(key + '::' + subItem[child]);
              if (first === true) {
                this.masterEntCount++;
              } else {
                this.cloneEntCount++;
              }
            }
          }
        } else {
          c.simpleName.push(key + '::' + subItem);
          if (first === true) {
            this.masterEntCount++;
          } else {
            this.cloneEntCount++;
          }
        }
      }
    }
    return c;
  }
}
