import { Component, OnInit } from '@angular/core';
import { BasicAttributes } from '../model/basic-attributes';
import { PageResults } from '../model/page-results';
import { IDNService } from '../service/idn.service';
import { AccessRequestAuditAccountFull } from '../model/AccessRequestAudit';
import { ActivityReport } from '../model/ActivityReport';
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
  activeDetails: Map<String, ActivityReport>;
  auditDetails: Array<AccessRequestAuditAccountFull>;
  limit: number;
  errorCount: number;
  totalApps: number = 9999;
  showQuery: boolean;

  constructor(private idnService: IDNService) {}

  ngOnInit() {
    this.limit = 200;
    this.auditDetails = [];
    this.loading = false;
    if (this.filterApplications == null) {
      this.getApplicationNames();
    }
  }
  showQueryChange() {
    if (this.showQuery == false) {
      this.showQuery = true;
    } else {
      this.showQuery = false;
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

  async submit() {
    this.auditDetails = [];
    this.errorCount = 0;
    this.loading = true;
    this.showQuery = false;
    this.activeDetails = new Map();
    for (let a = 0; a < this.filterApplications.length; a++) {
      const app = this.filterApplications[a];
      const report = new ActivityReport();
      report.appName = app.name;
      this.activeDetails.set(app.name, report);
    }

    console.log(this.sourceName);
    //Total Provisioning
    for (let a = 0; a < this.filterApplications.length; a++) {
      const app = this.filterApplications[a];
      const totalProvisioning = {
        query: {
          query: `type:provisioning AND created:[now-24h TO now] AND attributes.cloudAppName.exact:"${app.name}" AND NOT attributes.interface:"Attribute Sync"`,
        },
        indices: ['events'],
      };

      const tpData = await this.idnService
        .eventCount(totalProvisioning)
        .toPromise();
      console.log(app.value + ':' + tpData.length);
      let headers = tpData.headers;
      let n = new AccessRequestAuditAccountFull();
      n.pk = app.name;
      console.log(app.name);
      n.value = headers.get('X-Total-Count');
      this.activeDetails.get(app.name).provision = headers.get('X-Total-Count');
      this.auditDetails.push(n);
      this.activeDetails.get(app.name).provisionQuery =
        totalProvisioning.query.query;
      this.errorCount++;
      console.log(a + 'Seq:' + tpData);

      //Failed Provisioning provisioningCountBySourceFailures
      const failed = {
        query: {
          query: `type:provisioning AND created:[now-24h TO now] AND attributes.cloudAppName.exact:"${app.name}" AND NOT attributes.interface:"Attribute Sync" AND _exists_:attributes.errors`,
        },
        indices: ['events'],
      };
      const faildData = await this.idnService.eventCount(failed).toPromise();
      console.log(app.value + ':' + faildData.length);
      headers = faildData.headers;
      n = new AccessRequestAuditAccountFull();
      n.pk = app.name;
      console.log(app.name);
      n.value = headers.get('X-Total-Count');
      this.activeDetails.get(app.name).provisionFail =
        headers.get('X-Total-Count');
      this.activeDetails.get(app.name).provisionFailQuery = failed.query.query;
      this.errorCount++;

      const syncCount = {
        query: {
          query: `attributes.interface.exact:/Attribute Syn.+/ AND (attributes.sourceName.exact:"${app.name}") AND created:[now-24h TO now]`,
        },
        indices: ['events'],
      };
      const syncCountFailure = {
        query: {
          query: `attributes.interface.exact:/Attribute Syn.+/ AND (attributes.sourceName.exact:"${app.name}") AND created:[now-24h TO now]  AND _exists_:attributes.errors`,
        },
        indices: ['events'],
      };

      const syncDataFailure = await this.idnService
        .eventCount(syncCountFailure)
        .toPromise();
      console.log(app.value + ':' + syncDataFailure.length);
      headers = syncDataFailure.headers;
      n = new AccessRequestAuditAccountFull();
      n.pk = app.name;
      console.log(app.name);
      n.value = headers.get('X-Total-Count');
      this.activeDetails.get(app.name).syncFailure =
        headers.get('X-Total-Count');
      this.activeDetails.get(app.name).syncFailQuery = syncCountFailure.query.query;
      this.errorCount++;

      const syncData = await this.idnService.eventCount(syncCount).toPromise();
      console.log(app.value + ':' + syncData.length);
      headers = syncData.headers;
      n = new AccessRequestAuditAccountFull();
      n.pk = app.name;
      console.log(app.name);
      n.value = headers.get('X-Total-Count');
      this.activeDetails.get(app.name).sync = headers.get('X-Total-Count');
      this.activeDetails.get(app.name).syncQuery = syncCount.query.query;
      this.errorCount++;

      this.idnService.getTags('SOURCE', app.value).subscribe(myTag => {
        if (myTag != null) {
          this.activeDetails.get(app.name).tags = myTag.tags;
        } else {
          this.activeDetails.get(app.name).tags = 'none';
        }
      });
      //this.auditDetails.push(n);

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
      headers: [
        'appName',
        'sync',
        'syncFailure',
        'provision',
        'provisionFail',
        'tags',
      ],
    };

    const fileName = `mostActiveToday`;

    const download = [];
    for (const key of this.activeDetails.keys()) {
      download.push(this.activeDetails.get(key));
    }

    new AngularCsv(download, fileName, options);
  }
}
