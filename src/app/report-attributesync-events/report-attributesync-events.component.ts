import { Component, OnInit } from '@angular/core';
import { BasicAttributes } from '../model/basic-attributes';
import { PageResults } from '../model/page-results';
import { IDNService } from '../service/idn.service';
import { EventSync } from '../model/event-sync';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';

@Component({
  selector: 'app-report-attributesync-events',
  templateUrl: './report-attributesync-events.component.html',
  styleUrls: ['./report-attributesync-events.component.css'],
})
export class ReportAttributesyncEventsComponent implements OnInit {
  filterApplications: Array<BasicAttributes>;
  filterBasic: Array<BasicAttributes>;
  loading: boolean;
  sourceName: string;
  auditDetails: Array<EventSync>;
  limit: number;
  errorCount: number;

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
    localStorage.setItem(
      'applicationLookup',
      JSON.stringify(this.filterApplications)
    );
  }

  submit() {
    this.auditDetails = [];
    this.errorCount = 0;
    this.loading = true;
    console.log(this.sourceName);
    this.idnService
      .failuresBySource(this.sourceName, this.limit, true)
      .subscribe(data => {
        console.log(data.length);
        for (let sr = 0; sr < data.length; sr++) {
          const reg = data[sr];
          if (reg) {
            const event = new EventSync();
            event.id = reg.trackingNumber;
            event.created = reg.created;
            event.technicalName = reg.technicalName;
            if (reg.target) {
              event.target = reg.target.name;
            }
            event.name = reg.name;
            event.action = reg.action;

            if (reg.attributes) {
              event.previousValue = reg.attributes.previousValue;
              event.accountName = reg.attributes.accountName;
              event.attributeValue = reg.attributes.attributeValue;
              event.operation = reg.attributes.operation;
              event.attributeName = reg.attributes.attributeName;
              event.previousValue = reg.attributes.previousValue;
              event.errors = reg.attributes.errors;
              event.provisioningResult = reg.attributes.provisioningResult;
            }
            this.auditDetails.push(event);

            this.errorCount++;
          }
        }
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
        'id',
        'created',
        'technicalName',
        'target',
        'name',
        'action',
        'provisioningResult',
        'accountName',
        'attributeValue',
        'operation',
        'attributeName',
        'previousValue',
        'errors',
      ],
    };

    //Remove double quotes and make single
    for (let i = 0; i < this.auditDetails.length; i++) {
      if (this.auditDetails[i].errors) {
        this.auditDetails[i].errors = this.auditDetails[i].errors
          .toString()
          .replace(/["]/g, "'");
      }
    }

    const fileName = `${this.sourceName}-provisioning`;

    new AngularCsv(this.auditDetails, fileName, options);
  }
}
