import { Component, OnInit } from '@angular/core';
import { IDNService } from '../service/idn.service';
import { ReportFailures } from '../model/report-failures';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';

@Component({
    selector: 'app-report-failures',
    templateUrl: './report-failures.component.html',
    styleUrls: ['./report-failures.component.css'],
    standalone: false
})
export class ReportFailuresComponent implements OnInit {
  constructor(private idnService: IDNService) {}

  errors: ReportFailures[];
  accessRequestCount: number;
  refreshCount: number;
  searchText: string;
  successCount: number;
  totalFailures: number;
  pageOptions: readonly number[] = [1, 3, 7, 30, 90];
  pageSize: number;
  attributeSync: boolean;
  totals: Map<String, number>;
  ngOnInit(): void {
    this.attributeSync = false;
    this.errors = new Array();
    this.pageSize = 3;
    console.log('Startying query');
    this.search();
    this.totals = null;
  }

  attributeFailures() {
    this.attributeSync = true;
    this.search();
  }

  summery() {
    this.totals = new Map<String, number>();
    for (let i = 0; i < this.errors.length; i++) {
      const each = this.errors[i];
      let count = 0;
      if (this.totals.get(each.sources) != null) {
        count = this.totals.get(each.sources);
      }
      count++;
      this.totals.set(each.sources, count);
    }
    const sorted = [...this.totals].sort();
    this.totals = new Map(sorted);
  }

  search() {
    this.totals = null;
    if (this.attributeSync) {
      this.getSyncData(
        'type:provisioning AND status:FAILED AND created:[now-' +
          this.pageSize +
          'd TO now] AND attributes.interface:"Attribute Sync"'
      );
    } else {
      this.getRecordCount(
        'success',
        'created:[now-' + this.pageSize + 'd TO now] AND status:"Complete"'
      );
      this.getData(
        'created:[now-' +
          this.pageSize +
          'd TO now] AND (status:"incomplete" OR status:"failure")'
      );
    }
  }

  saveInCsv() {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useHeader: true,
      headers: [
        'status',
        'id',
        'trackingNumber',
        'created',
        'sources',
        'action',
        'identityName',
        'firstError',
      ],
      nullToEmptyString: true,
    };

    new AngularCsv(this.errors, 'errors', options);
  }

  getRecordCount(success, queryString): number {
    let count = 0;
    this.accessRequestCount = 0;
    this.refreshCount = 0;
    this.idnService.searchActivites(queryString).subscribe(response => {
      const headers = response.headers;
      count = headers.get('X-Total-Count');
      if (success == 'success') {
        this.successCount = count;
      }
      console.log(count);
    });
    return count;
  }

  getData(queryString) {
    this.errors = new Array();
    this.accessRequestCount = 0;
    this.refreshCount = 0;
    this.idnService.searchActivites(queryString).subscribe(response => {
      const searchResult = response.body;
      const headers = response.headers;
      this.totalFailures = headers.get('X-Total-Count');
      for (let i = 0; i < searchResult.length; i++) {
        const rf = new ReportFailures();
        rf.action = searchResult[i].action;
        if (rf.action == 'Identity Refresh') {
          this.refreshCount++;
        } else {
          this.accessRequestCount++;
        }
        rf.status = searchResult[i].status;
        rf.id = searchResult[i].id;
        rf.trackingNumber = searchResult[i].trackingNumber;
        rf.created = searchResult[i].created;
        rf.sources = searchResult[i].sources;
        rf.errors = searchResult[i].errors;
        rf.identityName = searchResult[i].recipient.name;
        if (searchResult[i].errors != null) {
          rf.firstError = searchResult[i].errors[0];
        } else {
          rf.firstError = '';
        }
        this.errors.push(rf);
      }
    });
  }

  getSyncData(queryString) {
    this.errors = new Array();
    this.accessRequestCount = 0;
    this.refreshCount = 0;
    this.idnService.searchAttributeSync(queryString).subscribe(response => {
      const searchResult = response.body;
      const headers = response.headers;
      this.totalFailures = headers.get('X-Total-Count');
      for (let i = 0; i < searchResult.length; i++) {
        const rf = new ReportFailures();
        rf.action = searchResult[i].action;
        if (rf.action == 'Identity Refresh') {
          this.refreshCount++;
        } else {
          this.accessRequestCount++;
        }
        rf.status = searchResult[i].status;
        rf.id = searchResult[i].id;
        rf.trackingNumber = searchResult[i].id;
        rf.created = searchResult[i].created;
        rf.sources = searchResult[i].sources;

        if (searchResult[i].attributes) {
          rf.sources = searchResult[i].attributes.sourceName;
          rf.errors = searchResult[i].attributes.errors;
          rf.firstError = searchResult[i].attributes.errors;
        }
        rf.identityName = searchResult[i].target.name;

        this.errors.push(rf);
      }
    });
  }
}
