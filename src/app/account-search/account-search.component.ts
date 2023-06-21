import { Component, OnInit } from '@angular/core';
import { IDNService } from '../service/idn.service';
//import { AuthenticationService } from '../service/authentication-service.service';
//import { MessageService } from '../service/message.service';
import { SimpleQueryCondition } from '../model/simple-query-condition';
import { PageResults } from '../model/page-results';
import { BasicAttributes } from '../model/basic-attributes';
import { AccountOnly } from '../model/AccountOnly';

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

  //Pages
  page: PageResults;

  constructor(
    private idnService: IDNService //private authenticationService: AuthenticationService, //private messageService: MessageService
  ) {}

  ngOnInit() {
    this.page = new PageResults();
    this.page.limit = 50;
    this.details = null;
    this.rawObject = null;
    this.identityList = null;
    this.filterTypes = new Array<BasicAttributes>();
    this.addFilterTypes();
    this.loading = false;
  }

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

    let filter = 'co';
    for (let i = 0; i < this.filterTypes.length; i++) {
      const b = this.filterTypes[i];
      if (b.name == this.selectedFilterTypes) {
        filter = b.value;
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
}
