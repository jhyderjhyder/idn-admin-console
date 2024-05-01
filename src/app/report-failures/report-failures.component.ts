import { Component, OnInit } from '@angular/core';
import { IDNService } from '../service/idn.service';
import { ReportFailures } from '../model/report-failures';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';

@Component({
  selector: 'app-report-failures',
  templateUrl: './report-failures.component.html',
  styleUrls: ['./report-failures.component.css'],
})
export class ReportFailuresComponent implements OnInit {
  constructor(private idnService: IDNService) {}

  errors: ReportFailures[];
  accessRequestCount: number;
  refreshCount: number;
  searchText: string;
  successCount: number;
  totalFailures: number;
  ngOnInit(): void {
    this.errors = new Array();
    console.log('Startying query');
    this.getRecordCount(
      'success',
      'created:[now-3d TO now] AND status:"Complete"'
    );
    this.getData('created:[now-3d TO now] AND status:"incomplete"');
  }

  saveInCsv() {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useHeader: true,
      headers: [
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
    this.accessRequestCount = 0;
    this.refreshCount = 0;
    this.idnService.searchActivites(queryString).subscribe(response => {
      const searchResult = response.body;
      this.errors = new Array();
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
}
