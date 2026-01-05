import { Component, OnInit } from '@angular/core';
import { IDNService } from '../service/idn.service';
import { Source } from '../model/source';
import { AuthenticationService } from '../service/authentication-service.service';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';
import { PageResults } from '../model/page-results';

@Component({
    selector: 'app-system-monitor-source',
    templateUrl: './system-monitor-source.component.html',
    styleUrls: ['./system-monitor-source.component.css'],
    standalone: false
})
export class SystemMonitorSourceComponent implements OnInit {
  hidePageOption: boolean;
  loading: boolean;
  exporting: boolean;
  block: boolean;
  sources: Source[];
  loadedCount: number;
  sourceCount: number;
  success: number;
  failure: number;
  unknown: number;
  allSources: any;
  searchText: string;
  page: PageResults;
  pageOptions: readonly number[] = [10, 50, 100, 200, 250];

  constructor(
    private idnService: IDNService,
    private authenticationService: AuthenticationService
  ) {}
  ngOnInit() {
    console.log('Started Monitor');
    this.page = new PageResults();
    this.hidePageOption = false;
    this.page.limit = 10;
    this.search();
  }

  shortdate(input) {
    try {
      const d = new Date(input);
      const f = d.getMonth() + '/' + d.getDay() + '/' + d.getFullYear();
      return f;
    } catch {}
    return input;
  }

  /**
   * Copy these three functions to any
   * page you want to have paggination
   */
  //Get the next page
  getNextPage() {
    this.page.nextPage;
    this.search();
  }
  //Get the previous page
  getPrevPage() {
    this.page.prevPage;
    this.search();
  }
  //Pick the page Number you want
  getOnePage(input) {
    this.page.getPageByNumber(input - 1);
    this.search();
  }

  searchNoClear() {
    this.sources = [];
    this.hidePageOption = true;
    this.getOnePage(1);
    while (this.page.hasMorePages) {
      this.getNextPage();
    }
    this.allSources.sort((a, b) => a.name.localeCompare(b.name));
  }

  search() {
    this.sources = [];
    this.searchPage();
  }

  searchPage() {
    this.loading = true;
    this.block = true;
    this.success = 0;
    this.failure = 0;
    this.unknown = 0;
    this.idnService
      .getAllSourcesPaged(this.page, null)
      .subscribe(async response => {
        const allSources = response.body;
        const headers = response.headers;
        this.page.xTotalCount = headers.get('X-Total-Count');

        this.sourceCount = allSources.length;
        this.allSources = allSources;

        //Sort it alphabetically
        allSources.sort((a, b) => a.name.localeCompare(b.name));

        let index = 0;
        for (const each of allSources) {
          if (index > 0 && index % 5 == 0) {
            // After processing every batch (10 sources), wait for 1 second before calling another API to avoid 429
            // Too Many Requests Error
            await this.sleep(1000);
          }
          index++;

          const source = new Source();
          source.id = each.id;
          source.cloudExternalID = each.connectorAttributes.cloudExternalId;
          if (each.cluster) {
            source.cluster = each.cluster.name;
          }

          source.name = each.name;
          source.description = each.description;
          if (each.description.length > 10) {
            source.description = each.description.slice(0, 10) + '...';
          }

          source.type = each.type;
          source.created = each.created;
          source.authoritative = each.authoritative;

          if (source.authoritative) {
            source.name = source.name + ' (Authoritative)';
          }

          this.idnService.getSourceV3Api(source.id).subscribe(
            searchResult => {
              source.schemaCount = searchResult.schemas.length;
              source.lastAggregationDate =
                searchResult.connectorAttributes.lastAggregationDate_account;
              source.health = searchResult.healthy;
            },
            err => {
              console.log(err);
            }
          );

          this.idnService.getTags('SOURCE', source.id).subscribe(myTag => {
            if (myTag != null) {
              source.labels = myTag.tags;
            } else {
              source.labels = ['none'];
            }
          });

          this.testConnection(source);
          this.loadedCount = this.sources.length;
        }
        this.loading = false;
        this.block = false;
      });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  testConnection(input: Source) {
    this.idnService.getSourceTest(input.id).subscribe(searchResult => {
      if (searchResult.status != null) {
        input.testConnectionStatus = searchResult.status;
        if (searchResult.status == 'SUCCESS') {
          this.success++;
        }
        if (
          searchResult.details != null &&
          searchResult.details.error != null
        ) {
          input.testConnectionDetails = searchResult.details.error;
          if (input.testConnectionDetails != null) {
            input.testConnectionDetails = input.testConnectionDetails.replace(
              /(?:\r\n|\r|\n)/g,
              ' '
            );
          }
          this.failure++;
        }
      } else {
        this.unknown++;
        input.testConnectionStatus = 'UNKNOWN';
        input.testConnectionDetails = JSON.stringify(searchResult);
      }
    });

    this.sources.push(input);
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
        'cluster',
        'type',
        'labels',
        'testConnectionStatus',
        'health',
        'created',
        'lastAggregationDate',
        'testConnectionDetails',
      ],
      nullToEmptyString: true,
    };

    const currentUser = this.authenticationService.currentUserValue;
    const fileName = `${currentUser.tenant}-SourceStatus`;

    const arr = [];
    for (const each of this.sources) {
      const record = Object.assign(each);
      arr.push(record);
    }

    new AngularCsv(arr, fileName, options);
  }
}
