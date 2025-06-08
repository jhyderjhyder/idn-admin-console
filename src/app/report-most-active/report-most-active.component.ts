import { Component, OnInit } from '@angular/core';
import { BasicAttributes } from '../model/basic-attributes';
import { PageResults } from '../model/page-results';
import { IDNService } from '../service/idn.service';
import { AccessRequestAuditAccountFull } from '../model/AccessRequestAudit';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';

@Component({
  selector: 'app-report-most-active',
  templateUrl: './report-most-active.component.html',
  styleUrls: ['./report-most-active.component.css'],
})
export class ReportMostActiveComponent implements OnInit {
  filterApplications: Array<BasicAttributes>;
  filterBasic: Array<BasicAttributes>;
  loading: boolean;
  sourceName: string;
  auditDetails: Array<AccessRequestAuditAccountFull>;
  limit: number;
  errorCount: number;
  totalApps: number = 9999;

  constructor(private idnService: IDNService) {}

  ngOnInit() {
    this.limit = 200;
    this.auditDetails = [];
    this.loading = false;
    if (this.filterApplications == null) {
      this.getApplicationNames();
    }
  }

  reloadApplications() {
    localStorage.removeItem('applicationLookup');
    this.getApplicationNames();
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
    all.name = 'Loading';
    all.value = '';
    this.filterApplications.push(all);
    this.idnService.getAllSourcesPaged(pr, null).subscribe(async response => {
      const headers = response.headers;
      pr.xTotalCount = headers.get('X-Total-Count');
      this.totalApps = pr.xTotalCount;

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
        pr.limit = 50;

        await new Promise(resolve => {
          while (pr.totalPages >= max && max < 10) {
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

  submit() {
    this.auditDetails = [];
    this.errorCount = 0;
    this.loading = true;
    console.log(this.sourceName);
    for (let a = 0; a < this.filterApplications.length; a++) {
      const app = this.filterApplications[a];
      this.idnService.provisioningCountBySource(app.name, 1).subscribe(data => {
        console.log(app.value + ':' + data.length);
        const headers = data.headers;
        const n = new AccessRequestAuditAccountFull();
        n.pk = app.name;
        console.log(app.name);
        n.value = headers.get('X-Total-Count');
        this.auditDetails.push(n);
      });
      this.loading = false;
    }
  }

  download() {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useHeader: true,
      nullToEmptyString: true,
      headers: ['pk', 'name', 'value'],
    };

    const fileName = `mostActiveToday`;

    new AngularCsv(this.auditDetails, fileName, options);
  }
}
