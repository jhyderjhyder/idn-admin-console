import { Component, OnInit } from '@angular/core';
import { BasicAttributes } from '../model/basic-attributes';
import { PageResults } from '../model/page-results';
import { IDNService } from '../service/idn.service';
import { AccessRequestAuditAccountFull } from '../model/AccessRequestAudit';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';

@Component({
  selector: 'app-report-failures-source',
  templateUrl: './report-failures-source.component.html',
  styleUrls: ['./report-failures-source.component.css'],
})
export class ReportFailuresSourceComponent implements OnInit {
  filterApplications: Array<BasicAttributes>;
  filterBasic: Array<BasicAttributes>;
  loading: boolean;
  sourceName: string;
  auditDetails: Array<AccessRequestAuditAccountFull>;
  limit: number;
  errorCount: number;

  constructor(private idnService: IDNService) {}

  ngOnInit() {
    this.limit = 200;
    this.auditDetails = [];
    if (this.filterApplications == null) {
      this.loading = true;
      this.getApplicationNames();
    }
  }

  /*
Populate the dropdown of sources you
can pick from
*/
  getApplicationNames() {
    const pr = new PageResults();
    pr.limit = 200;
    this.filterApplications = new Array<BasicAttributes>();
    const all = new BasicAttributes();
    all.name = 'Loading';
    all.value = '';
    this.filterApplications.push(all);
    this.idnService.getAllSourcesPaged(pr, null).subscribe(response => {
      const headers = response.headers;
      pr.xTotalCount = headers.get('X-Total-Count');
    });
    let max = 1;
    while (pr.hasMorePages && max < 10) {
      max++;
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
      pr.nextPage;
    }
  }

  addSorted(basic: BasicAttributes) {
    this.filterApplications.push(basic);
    this.filterApplications.sort((a, b) => a.name.localeCompare(b.name));
  }

  submit() {
    this.auditDetails = [];
    this.errorCount = 0;

    console.log(this.sourceName);
    this.idnService
      .failuresBySource(this.sourceName, this.limit)
      .subscribe(data => {
        console.log(data.length);
        for (let sr = 0; sr < data.length; sr++) {
          const raw = data[sr];

          if (raw.accountRequests) {
            for (let i = 0; i < raw.accountRequests.length; i++) {
              const reg = raw.accountRequests[i];
              const account = new AccessRequestAuditAccountFull();
              account.pk = sr.toString() + ':' + i.toString();
              account.accountId = reg.accountId;
              account.op = reg.op;
              account.source = reg.source.name;
              account.status = reg.result.status;
              account.created = raw.created;
              account.modified = raw.modified;
              account.trackingNumber = raw.trackingNumber;
              if (raw.requester) {
                account.requester = raw.requester.name;
              }
              if (raw.recipient) {
                account.recipient = raw.recipient.name;
              }
              if (reg.result) {
                if (reg.result.errors) {
                  account.status = reg.result.status;
                  account.errors = reg.result.errors;
                }
              }
              if (account.source === this.sourceName) {
                console.log('Our Application:' + account.source);
                for (let a = 0; a < reg.attributeRequests.length; a++) {
                  const audit = this.cloneAuditDetails(account);
                  const ar = reg.attributeRequests[a];
                  audit.name = ar.name;
                  audit.value = ar.value;
                  audit.op = ar.op;
                  //account.errors = "";
                  if (ar.result) {
                    if (ar.result.status != null) {
                      audit.errors = ar.result.status + ':';
                    }
                    if (ar.result.errors) {
                      audit.errors = ar.result.errors;
                    }
                  }
                  if (account.errors || audit.errors) {
                    this.auditDetails.push(audit);
                  }
                }
              } else {
                //console.log("Not our application");
              }

              this.errorCount++;
            }
          }
        }
      });
  }

  private cloneAuditDetails(account: AccessRequestAuditAccountFull) {
    const audit = new AccessRequestAuditAccountFull();
    audit.accountId = account.accountId;
    audit.op = account.op;
    audit.source = account.source;
    audit.status = account.status;
    audit.errors = account.errors;
    audit.created = account.created;
    audit.modified = account.modified;
    audit.recipient = account.recipient;
    audit.requester = account.requester;
    audit.pk = account.pk;
    audit.trackingNumber = account.trackingNumber;
    return audit;
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
        'pk',
        'trackingNumber',
        'created',
        'modified',
        'requester',
        'recipient',
        'source',
        'status',
        'accountId',
        'op',
        'name',
        'value',
        'errors',
      ],
    };
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
