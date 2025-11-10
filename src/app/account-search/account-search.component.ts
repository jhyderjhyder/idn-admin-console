import { Component, OnInit } from '@angular/core';
import { IDNService } from '../service/idn.service';
//import { AuthenticationService } from '../service/authentication-service.service';
//import { MessageService } from '../service/message.service';
import { SimpleQueryCondition } from '../model/simple-query-condition';
import { PageResults } from '../model/page-results';
import { BasicAttributes } from '../model/basic-attributes';
import { AccountOnly } from '../model/AccountOnly';
import { IdentityAttribute } from '../model/identity-attribute';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';

@Component({
  selector: 'app-account-search',
  templateUrl: './account-search.component.html',
  styleUrls: ['./account-search.component.css'],
})
export class AccountSearchComponent implements OnInit {
  loading: boolean;
  accountName: string;
  sourceName: string;
  identityList: Object;
  details: Array<BasicAttributes>;
  rawObject: AccountOnly;
  selectedFilterTypes: string;
  filterTypes: Array<BasicAttributes>;
  selectedFilterAttributes: string;
  filterAttributes: Array<String>;
  filterApplications: Array<BasicAttributes>;
  rawIdentity: IdentityAttribute;

  //Pages
  page: PageResults;

  constructor(
    private idnService: IDNService //private authenticationService: AuthenticationService, //private messageService: MessageService
  ) {}

  ngOnInit() {
    if (this.filterApplications == null) {
      this.loading = true;
      this.getApplicationNames();
    }
    this.page = new PageResults();
    this.page.limit = 250;
    this.details = null;
    this.rawObject = null;
    this.identityList = null;
    this.filterTypes = new Array<BasicAttributes>();
    this.addFilterTypes();
    this.loading = false;
  }
  /*
Populate the dropdown of sources you
can pick from
*/
  async getApplicationNames() {
    const pr = new PageResults();
    pr.limit = 1;
    this.filterApplications = new Array<BasicAttributes>();
    const all = new BasicAttributes();
    all.name = 'ALL';
    all.value = '';
    this.filterApplications.push(all);
    this.idnService.getAllSourcesPaged(pr, null).subscribe(async response => {
      const headers = response.headers;
      pr.xTotalCount = headers.get('X-Total-Count');

      if (localStorage.getItem('applicationLookup') != null) {
        this.filterApplications = JSON.parse(
          localStorage.getItem('applicationLookup')
        );
      }
      console.log(this.filterApplications.length + ':' + pr.xTotalCount);
      if (this.filterApplications.length >= pr.xTotalCount) {
        console.log('No reload required lets rock');
      } else {
        console.log('loading applications');
        let max = 0;
        pr.limit = 250;

        await new Promise(resolve => {
          while (pr.totalPages >= max && max < 100) {
            console.log('Start while:' + max);
            this.idnService.getAllSourcesPaged(pr, null).subscribe(response => {
              const searchResult = response.body;
              for (let i = 0; i < searchResult.length; i++) {
                const app = searchResult[i];
                const basic = new BasicAttributes();
                basic.name = app['name'];
                basic.value = app['id'];
                this.addSorted(basic);
              }
            });

            max++;
            pr.nextPage;
            resolve;
          }
        });
      }
    });
  }

  addSorted(basic: BasicAttributes) {
    this.filterApplications.push(basic);
    this.filterApplications.sort((a, b) => a.name.localeCompare(b.name));
  }

  getOwnerDetails(identityID) {
    this.idnService.searchIdentities(identityID).subscribe(response => {
      const one = response[0];
      this.rawIdentity = new IdentityAttribute();
      this.rawIdentity.displayName = one['displayName'];
      this.rawIdentity.name = one['name'];
      //this.rawIdentity = response;
    });
  }
  /*
Loads the dropdown for filter types
*/
  addFilterTypes() {
    const eq = new BasicAttributes();
    eq.name = 'Equal';
    eq.value = 'eq';
    this.filterTypes.push(eq);
    const ct = new BasicAttributes();
    ct.name = 'Contains';
    ct.value = 'co';
    this.filterTypes.push(ct);
    const sw = new BasicAttributes();
    sw.name = 'StartsWith';
    sw.value = 'sw';
    this.filterTypes.push(sw);
    this.selectedFilterTypes = eq.name;

    this.filterAttributes = new Array<String>();
    this.filterAttributes.push('name');
    this.filterAttributes.push('nativeIdentity');
    this.selectedFilterAttributes = 'name';
  }

  /**
   * Copy these three functions to any
   * page you want to have paggination
   */
  //Get the next page
  getNextPage() {
    this.page.nextPage;
    this.submit();
  }
  //Get the previous page
  getPrevPage() {
    this.page.prevPage;
    this.submit();
  }
  //Pick the page Number you want
  getOnePage(input) {
    this.page.getPageByNumber(input - 1);
    this.submit();
  }

  getDetails(input) {
    this.rawObject = this.identityList[input];
    if (this.rawObject['identityId']) {
      this.getOwnerDetails(this.rawObject['identityId']);
    }
    if (this.identityList[input].attributes) {
      this.details = new Array();
      const atts = Object.entries(this.identityList[input].attributes);
      for (let i = 0; i < atts.length; i++) {
        let [name, value] = atts[i];
        if (value == null) {
          value = 'NULL';
        }
        this.details.push({
          name: name,
          value: value.toString(),
        });
      }
      this.details.sort((a, b) => a.name.localeCompare(b.name));
    }
    this.identityList = null;
  }

  submit() {
    this.loading = true;
    this.details = null;
    this.rawObject = null;

    const query = new SimpleQueryCondition();
    query.attribute = this.sourceName;
    query.value = this.accountName;

    //Loop the array of English filters looking for the sailpoint filterName
    let filter = 'co';
    for (let i = 0; i < this.filterTypes.length; i++) {
      const b = this.filterTypes[i];
      if (b.name == this.selectedFilterTypes) {
        filter = b.value;
      }
    }
    //Loop the array of application names looking for the ID# of the source
    for (let i = 0; i < this.filterApplications.length; i++) {
      const b = this.filterApplications[i];
      if (b.name == this.sourceName) {
        query.attribute = b.value;
      }
    }

    this.idnService
      .searchApplicationAccounts(
        query,
        this.page,
        filter,
        this.selectedFilterAttributes
      )
      .subscribe(response => {
        const searchResult = response.body;
        const headers = response.headers;
        this.page.xTotalCount = headers.get('X-Total-Count');
        this.identityList = searchResult;
        //console.table(this.identityList);
        this.loading = false;
      });
  }
   download() {
      const options = {
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalseparator: '.',
        showLabels: true,
        useHeader: true,
        nullToEmptyString: true,
        headers: [
        'sourceName',
        'nativeIdentity',
        'name',
        'systemAccount',
        'uncorrelated',
        'disabled',
        'locked',
        'manuallyCorrelated',
        'sourceId'
      ],
      };
  
      const fileName = `accountList`;
   
  
      new AngularCsv(this.identityList, fileName, options);
    }
}
