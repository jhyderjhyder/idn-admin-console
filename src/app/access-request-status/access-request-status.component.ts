import { Component, OnInit } from '@angular/core';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';
import { IDNService } from '../service/idn.service';
import { AuthenticationService } from '../service/authentication-service.service';
import { MessageService } from '../service/message.service';
import { AccessRequestStatus } from '../model/access-request-status';
import { SimpleQueryCondition } from '../model/simple-query-condition';
import { PageResults } from '../model/page-results';

@Component({
  selector: 'app-access-request-status',
  templateUrl: './access-request-status.component.html',
  styleUrls: ['./access-request-status.component.css'],
})
export class AccessRequestStatusComponent implements OnInit {
  accessRequestStatuses: AccessRequestStatus[];
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

  constructor(
    private idnService: IDNService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.reset();
    this.getAllAccessRequestStatus();
  }
  pickData(input) {
    this.lineNumber = input;
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
      this.messageService.setError('Identity value cannot be null');
      return;
    }
  }

  reset() {
    this.page = new PageResults();
    this.page.limit = 25;
    this.accessRequestStatuses = null;
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
      .getAccessRequestStatusPaged(this.filters, this.page)
      .subscribe(response => {
        const results = response.body;
        const headers = response.headers;
        this.page.xTotalCount = headers.get('X-Total-Count');

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

          if (each.requesterComment && each.requesterComment.comment) {
            accessRequestStatus.requesterComment =
              each.requesterComment.comment;
          }

          if (each.sodViolationContext && each.sodViolationContext.state) {
            accessRequestStatus.sodViolationState =
              each.sodViolationContext.state;
          }

          this.accessRequestStatuses.push(accessRequestStatus);
        }
        this.loading = false;
      });
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
