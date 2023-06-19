import { Component, OnInit } from '@angular/core';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';
import { IDNService } from '../service/idn.service';
import { AuthenticationService } from '../service/authentication-service.service';
import { MessageService } from '../service/message.service';
import { WorkItem } from '../model/work-item';
import { SimpleQueryCondition } from '../model/simple-query-condition';

@Component({
  selector: 'app-work-items-status',
  templateUrl: './work-items-status.component.html',
  styleUrls: ['./work-items-status.component.css'],
})
export class WorkItemsStatusComponent implements OnInit {
  workItemsStatuses: WorkItem[];
  searchText: string;
  loading: boolean;
  errorMessage: string;
  totalOpen: number;
  totalCompleted: number;
  totalWorkItems: number;
  rawObject: string;

  constructor(
    private idnService: IDNService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.reset();
    this.getAllWorkItemsStatus();
    this.rawObject = null;
  }

  reset() {
    this.workItemsStatuses = null;
    this.searchText = null;
    this.errorMessage = null;
    this.loading = false;
    this.messageService.clearAll();
  }

  getAllWorkItemsStatus() {
    this.loading = true;

    this.totalOpen = 0;
    this.totalCompleted = 0;
    this.totalWorkItems = 0;

    this.idnService.getWorkItemsSummary().subscribe(results => {
      this.totalOpen = results.open;
      this.totalCompleted = results.completed;
      this.totalWorkItems = results.total;
    });

    this.workItemsStatuses = [];

    this.idnService.getWorkItemsPending().subscribe(results => {
      for (const each of results) {
        const workItemsStatus = new WorkItem();
        workItemsStatus.id = each.id;
        workItemsStatus.rawObject = each;

        if (each.requesterDisplayName) {
          workItemsStatus.requesterDisplayName = each.requesterDisplayName;
        } else {
          workItemsStatus.requesterDisplayName = 'NULL';
        }

        workItemsStatus.ownerName = each.ownerName;
        workItemsStatus.created = each.created;
        workItemsStatus.description = each.description;
        workItemsStatus.state = each.state;
        workItemsStatus.type = each.type;

        if (each.remediationItems && each.remediationItems.length) {
          workItemsStatus.remediationItems = each.remediationItems.length;
        } else {
          workItemsStatus.remediationItems = '0';
        }

        if (each.approvalItems && each.approvalItems.length) {
          workItemsStatus.approvalItems = each.approvalItems.length;
        } else {
          workItemsStatus.approvalItems = '0';
        }

        if (each.ownerId) {
          const query = new SimpleQueryCondition();
          query.attribute = 'id';
          query.value = each.ownerId;

          this.idnService.searchAccounts(query).subscribe(searchResult => {
            if (searchResult.length > 0) {
              workItemsStatus.ownerDisplayName = searchResult[0].displayName;
            } else {
              workItemsStatus.ownerDisplayName = 'NULL';
            }
          });
        } else {
          workItemsStatus.ownerDisplayName = 'NULL';
        }

        this.workItemsStatuses.push(workItemsStatus);
      }
    });

    this.idnService.getWorkItemsCompleted().subscribe(results => {
      for (const each of results) {
        const workItemsStatus = new WorkItem();
        workItemsStatus.rawObject = each;
        workItemsStatus.id = each.id;
        workItemsStatus.created = each.created;
        workItemsStatus.description = each.description;
        workItemsStatus.state = each.state;
        workItemsStatus.type = each.type;

        if (each.remediationItems && each.remediationItems.length) {
          workItemsStatus.remediationItems = each.remediationItems.length;
        } else {
          workItemsStatus.remediationItems = '0';
        }

        if (each.approvalItems && each.approvalItems.length) {
          workItemsStatus.approvalItems = each.approvalItems.length;
        } else {
          workItemsStatus.approvalItems = '0';
        }

        const query = new SimpleQueryCondition();
        query.attribute = 'name';

        if (each.ownerName) {
          query.value = each.ownerName;

          this.idnService.searchAccounts(query).subscribe(searchResult => {
            if (searchResult.length > 0) {
              workItemsStatus.ownerDisplayName = searchResult[0].displayName;
            } else {
              workItemsStatus.ownerDisplayName = 'NULL';
            }
          });
        } else {
          workItemsStatus.ownerDisplayName = 'NULL';
        }

        if (each.requesterDisplayName) {
          query.value = each.requesterDisplayName;

          this.idnService.searchAccounts(query).subscribe(searchResult => {
            if (searchResult.length > 0) {
              workItemsStatus.requesterDisplayName =
                searchResult[0].displayName;
            } else {
              workItemsStatus.requesterDisplayName = 'NULL';
            }
          });
        } else {
          workItemsStatus.requesterDisplayName = 'NULL';
        }

        this.workItemsStatuses.push(workItemsStatus);
      }
    });

    //To Sort in created date order on combining both API calls
    this.workItemsStatuses.sort((a, b) => a.created.localeCompare(b.created));

    this.loading = false;
  }

  getRawDetails(input) {
    //JSON.stringify(each, null, 4);
    const obj = JSON.stringify(
      this.workItemsStatuses[input].rawObject,
      null,
      4
    );
    this.rawObject = obj;
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
        'description',
        'requesterDisplayName',
        'ownerDisplayName',
        'created',
        'state',
        'type',
        'remediationItems',
        'approvalItems',
      ],
      nullToEmptyString: true,
    };

    const currentUser = this.authenticationService.currentUserValue;
    const fileName = `${currentUser.tenant}-work-items-status`;

    const arr = [];
    for (const each of this.workItemsStatuses) {
      const record = Object.assign(each);
      arr.push(record);
    }

    new AngularCsv(arr, fileName, options);
  }
}
