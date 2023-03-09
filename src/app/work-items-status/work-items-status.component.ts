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
  styleUrls: ['./work-items-status.component.css']
})
export class WorkItemsStatusComponent implements OnInit {
  workItemsStatuses: WorkItem[];
  searchText: string;
  loading: boolean;
  errorMessage: string;
  totalOpen: number;
  totalCompleted: number;
  totalWorkItems: number;


  constructor(private idnService: IDNService, 
    private authenticationService: AuthenticationService,
    private messageService: MessageService) { }

  ngOnInit() {
    this.reset();
    this.getAllWorkItemsStatus();
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

   this.idnService.getWorkItemsSummary()
   .subscribe(
     results => {
      this.totalOpen = results.open;
      this.totalCompleted = results.completed;
      this.totalWorkItems = results.total;

   });

   this.workItemsStatuses = [];

   this.idnService.getWorkItemsPending()
   .subscribe(
     results => {
     for (let each of results) {
      let workItemsStatus = new WorkItem();
       workItemsStatus.id = each.id;
       workItemsStatus.requesterId = each.requesterId;
       workItemsStatus.requesterDisplayName = each.requesterDisplayName;
       workItemsStatus.ownerId = each.ownerId;
       workItemsStatus.ownerName = each.ownerName;
       workItemsStatus.created = each.created;
       workItemsStatus.description = each.description;
       workItemsStatus.state = each.state;
       workItemsStatus.type = each.type;
       workItemsStatus.approvalItems = each.approvalItems.length;

       let query = new SimpleQueryCondition();
       query.attribute = "id";
       query.value = each.ownerId;

       this.idnService.searchAccounts(query)
       .subscribe(searchResult => { 
         if (searchResult.length > 0) {
          workItemsStatus.ownerDisplayName = searchResult[0].displayName;
         }
        }); 

       this.workItemsStatuses.push(workItemsStatus);
      }
    });

    this.idnService.getWorkItemsCompleted()
    .subscribe(
     results => {
       for (let each of results) {
        let workItemsStatus = new WorkItem();
         workItemsStatus.id = each.id;
         workItemsStatus.requesterId = each.requesterId;
         workItemsStatus.ownerId = each.ownerId;
         workItemsStatus.created = each.created;
         workItemsStatus.description = each.description;
         workItemsStatus.state = each.state;
         workItemsStatus.type = each.type;
         if (each.approvalItems != null) {
           workItemsStatus.approvalItems = each.approvalItems.length;
         }
         else {
           workItemsStatus.approvalItems = null;
         }

         let query = new SimpleQueryCondition();
         query.attribute = "name";
         query.value = each.ownerName;
  
         this.idnService.searchAccounts(query)
         .subscribe(searchResult => { 
           if (searchResult.length > 0) {
            workItemsStatus.ownerDisplayName = searchResult[0].displayName;
           }
          }); 

          query.value = each.requesterDisplayName;
   
          this.idnService.searchAccounts(query)
          .subscribe(searchResult => { 
            if (searchResult.length > 0) {
             workItemsStatus.requesterDisplayName = searchResult[0].displayName;
            }
           }); 

         this.workItemsStatuses.push(workItemsStatus);
       }
     });

     //To Sort in created date order on combining both API calls
     this.workItemsStatuses.sort((a,b) => a.created.localeCompare(b.created))

    this.loading = false;
  }

  saveInCsv() {
    var options = { 
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useHeader: true,
      headers: ["id", "description", "requesterDisplayName", "ownerDisplayName", "created", "state", "approvalItems"],
      nullToEmptyString: true,
    };

    const currentUser = this.authenticationService.currentUserValue;
    let fileName = `${currentUser.tenant}-work-items-status`;

    let arr = [];
    for (let each of this.workItemsStatuses) {
      let record = Object.assign(each);
      arr.push(record);
    }


    let angularCsv: AngularCsv = new AngularCsv(arr, fileName, options);
  }

}