import { Component, OnInit } from '@angular/core';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';
import { IDNService } from '../service/idn.service';
import { AuthenticationService } from '../service/authentication-service.service';
import { MessageService } from '../service/message.service';
import { AccessRequestStatus } from '../model/access-request-status';
import { SimpleQueryCondition } from '../model/simple-query-condition';
import { PageResults } from '../model/page-results';
import { prettyPrintJson } from 'pretty-print-json';
import { JsonFormatOptions } from '../model/json-format-options';

@Component({
  selector: 'app-access-request-status',
  templateUrl: './access-request-status.component.html',
  styleUrls: ['./access-request-status.component.css'],
})
export class AccessRequestStatusComponent implements OnInit {
  accessRequestStatuses: AccessRequestStatus[];
  accessRequestStatusesRaw: Object[];
  searchText: string;
  loading: boolean;
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  //Input plan text filter
  requestedFor: string;
  //Formated filter example &requested-for=2c9180857f2d882f017f38a5a877620b
  filters: string;
  page: PageResults;
  lineNumber;
  rawObject: string;
  oneRequest: AccessRequestStatus;
  clearButton: boolean;
  searchReqID: string;
  searchGt: string;
  searchLt: string;

  constructor(
    private idnService: IDNService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService
  ) {}

  clearJsonRaw() {
    const elem = document.getElementById('jsonRaw');
    elem.innerHTML = null;
    this.rawObject = null;
    this.clearButton = false;
  }
  ngOnInit() {
    this.reset();
    this.getAllAccessRequestStatus();
    this.rawObject = null;
    this.oneRequest = null;
    const elem = document.getElementById('jsonRaw');
    elem.innerHTML = '';
    this.clearButton = false;
  }
  pickData(input) {
    this.lineNumber = input;
    this.oneRequest = null;
    this.oneRequest = this.accessRequestStatuses[input];
  }
  getRawDetails(input) {
    this.lineNumber = input;
    //JSON.stringify(each, null, 4);
    const options: JsonFormatOptions = new JsonFormatOptions();
    options.lineNumbers = false;
    options.quoteKeys = true;
    options.trailingComma = false;

    //https://github.com/center-key/pretty-print-json
    const html = prettyPrintJson.toHtml(
      this.accessRequestStatusesRaw[input],
      options
    );
    //const obj = JSON.stringify(this.accessRequestStatuses[input], null, 4);

    const elem = document.getElementById('jsonRaw');
    this.rawObject = prettyPrintJson.toHtml(html);
    elem.innerHTML = html;
    this.clearButton = true;
  }

  /**
   * Copy these three functions to any
   * page you want to have paggination
   */
  //Get the next page
  getNextPage() {
    this.page.nextPage;
    this.getAllAccessRequestStatus();
  }
  //Get the previous page
  getPrevPage() {
    this.page.prevPage;
    this.getAllAccessRequestStatus();
  }
  //Pick the page Number you want
  getOnePage(input) {
    this.page.getPageByNumber(input - 1);
    this.getAllAccessRequestStatus();
  }

  getRequestedForUser() {
    if (this.requestedFor && this.requestedFor.trim() != '') {
      const query = new SimpleQueryCondition();
      query.attribute = 'name';
      query.value = this.requestedFor;

      this.idnService.searchAccounts(query).subscribe(searchResult => {
        if (searchResult && searchResult.length == 1) {
          this.filters = '' + searchResult[0].id;
          this.messageService.clearAll();
          this.getAllAccessRequestStatus();
        } else {
          this.messageService.setError(`Identity Account Name is Invalid`);
        }
      });
    } else {
      this.getAllAccessRequestStatus();
    }
  }

  reset() {
    this.page = new PageResults();
    this.page.limit = 25;
    this.accessRequestStatuses = null;
    this.accessRequestStatusesRaw = null;
    this.searchText = null;
    this.loading = false;
    this.requestedFor = null;
    this.filters = null;
    this.messageService.clearAll();
  }

  getAllAccessRequestStatus() {
    this.loading = true;

    this.totalPending = 0;
    this.totalApproved = 0;
    this.totalRejected = 0;

    this.idnService.getAccessRequestApprovalsSummary().subscribe(results => {
      this.totalPending = results.pending;
      this.totalApproved = results.approved;
      this.totalRejected = results.rejected;
    });

    this.idnService
      .getAccessRequestStatusPaged(
        this.filters,
        this.searchReqID,
        this.searchGt,
        this.searchLt,
        this.page,
        true
      )
      .subscribe(response => {
        console.log(response.states);
        const results = response.body;
        const headers = response.headers;
        this.page.xTotalCount = headers.get('X-Total-Count');

        this.accessRequestStatusesRaw = [];
        this.accessRequestStatuses = [];
        for (const each of results) {
          const accessRequestStatus = new AccessRequestStatus();
          accessRequestStatus.accessName = each.name;
          accessRequestStatus.accessType = each.type;
          accessRequestStatus.requestType = each.requestType;
          accessRequestStatus.state = each.state;
          accessRequestStatus.created = each.created;
          accessRequestStatus.requester = each.requester.name;
          accessRequestStatus.requestedFor = each.requestedFor.name;
          accessRequestStatus.approvalDetails = each.approvalDetails;
          accessRequestStatus.accessRequestPhases = each.accessRequestPhases;
          accessRequestStatus.id = each.accessRequestId;
          if (
            each.sodViolationContext &&
            each.sodViolationContext.violationCheckResult
          ) {
            if (
              Array.isArray(
                each.sodViolationContext.violationCheckResult.violatedPolicies
              )
            ) {
              accessRequestStatus.violationSize =
                each.sodViolationContext.violationCheckResult.violatedPolicies.length;
            } else {
              accessRequestStatus.violationSize = -2;
            }
          } else {
            accessRequestStatus.violationSize = 0;
          }
          if (each.requesterComment && each.requesterComment.comment) {
            accessRequestStatus.requesterComment =
              each.requesterComment.comment;
          }

          if (each.sodViolationContext && each.sodViolationContext.state) {
            accessRequestStatus.sodViolationState =
              each.sodViolationContext.state;
          }

          this.accessRequestStatuses.push(accessRequestStatus);
          this.accessRequestStatusesRaw.push(each);
        }
        this.loading = false;
      }),
      err => {
        console.log('timeout' + err);
      };
  }

  saveInCsv() {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useHeader: true,
      headers: [
        'accessName',
        'accessType',
        'requestType',
        'state',
        'sodViolationState',
        'created',
        'requester',
        'requestedFor',
        'requesterComment',
      ],
      nullToEmptyString: true,
    };

    const currentUser = this.authenticationService.currentUserValue;
    const fileName = `${currentUser.tenant}-access-request-status`;

    const arr = [];
    for (const each of this.accessRequestStatuses) {
      const record = Object.assign(each);
      arr.push(record);
    }

    new AngularCsv(arr, fileName, options);
  }
}
