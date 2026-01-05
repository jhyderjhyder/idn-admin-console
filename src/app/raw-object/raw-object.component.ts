import { Component, OnInit } from '@angular/core';
import { PageResults } from '../model/page-results';
import { IdnObject } from '../model/idn-object';
import { IDNService } from '../service/idn.service';

@Component({
    selector: 'app-raw-object',
    templateUrl: './raw-object.component.html',
    styleUrls: ['./raw-object.component.css'],
    standalone: false
})
export class RawObjectComponent implements OnInit {
  loading: boolean;
  filterTypes: Array<string>;
  selectedFilterTypes: string;
  rawObject: string;
  rawObjectID: string;
  page: PageResults;
  IdnObjects: IdnObject[];

  constructor(private idnService: IDNService) {}
  ngOnInit(): void {
    this.rawObject = null;
    this.filterTypes = new Array();
    this.filterTypes.push('v3/access-profiles');
    this.filterTypes.push('v3/access-request-config');
    this.filterTypes.push('v3/account-activities');
    this.filterTypes.push('v3/brandings');
    this.filterTypes.push('v3/campaign-filters');
    this.filterTypes.push('v3/campaigns');
    this.filterTypes.push('v3/auth-org/network-config');
    this.filterTypes.push('v3/identity-profiles');
    this.filterTypes.push('v3/sod-policies');
    this.filterTypes.push('v3/service-desk-integrations');

    this.filterTypes.push('beta/roles');

    this.page = new PageResults();
    this.page.limit = 200;
  }

  getRawDetails(input) {
    //this.lineNumber = input;
    //JSON.stringify(each, null, 4);
    const obj = JSON.stringify(this.IdnObjects[input].rawObject, null, 4);
    this.rawObject = obj;
    this.rawObjectID = this.IdnObjects[input].id;
  }

  clear() {
    this.rawObject = null;
    this.rawObjectID = null;
  }

  submit() {
    this.rawObject = null;
    console.log('proccesing:' + this.selectedFilterTypes);
    this.getAllObjects();
  }

  /**
   * Copy these three functions to any
   * page you want to have paggination
   */
  //Get the next page
  getNextPage() {
    this.page.nextPage;
    this.getAllObjects();
  }
  //Get the previous page
  getPrevPage() {
    this.page.prevPage;
    this.getAllObjects();
  }
  //Pick the page Number you want
  getOnePage(input) {
    this.page.getPageByNumber(input - 1);
    this.getAllObjects();
  }

  save() {
    //saveGeneralObject(rawFormData, primaryKeySource, objectPath:string):
    this.idnService
      .saveGeneralObject(
        this.rawObject,
        this.rawObjectID,
        this.selectedFilterTypes
      )
      .subscribe(response => {
        console.log(response);
      });
  }

  getAllObjects() {
    this.loading = true;
    this.rawObjectID = null;
    this.rawObject = null;
    this.idnService
      .getGeneralObject(this.page, this.selectedFilterTypes)
      .subscribe(response => {
        const results = response.body;
        const headers = response.headers;

        this.page.xTotalCount = headers.get('X-Total-Count');
        this.IdnObjects = [];
        if (Array.isArray(results)) {
          for (const each of results) {
            const idn = new IdnObject();
            idn.rawObject = each;
            idn.id = each.id;

            if (each.name) {
              idn.displayName = each.name;
            }

            this.IdnObjects.push(idn);
          }
        } else {
          const idn = new IdnObject();
          idn.rawObject = results;
          idn.id = 'Single Entry';
          this.IdnObjects.push(idn);
        }
        this.loading = false;
      });
  }
}
