import { Component, OnInit } from '@angular/core';
import { IDNService } from '../service/idn.service';

@Component({
  selector: 'app-report-approval-history',
  templateUrl: './report-approval-history.component.html',
  styleUrls: ['./report-approval-history.component.css'],
})
export class ReportApprovalHistoryComponent implements OnInit {
  constructor(private idnService: IDNService) {}

  hours: number = 48;
  actor: string = 'policyAgent01';
  total: number = 0;
  details: Array<ApproverActions>;
  ngOnInit(): void {}

  getData() {
    const queryString = `type: Access Requesst and created:[now-${this.hours}h] and actor.name:"${this.actor}"`;
    this.idnService.searchActivites(queryString).subscribe(response => {
      const searchResult = response.body;
      const headers = response.headers;
      this.total = headers.get('X-Total-Count');
      for (let i = 0; i < searchResult.length; i++) {
        console.log(searchResult[i]);
        const ar = new ApproverActions();
        this.details.push(ar);
      }
    });
  }
}

export class ApproverActions {
  created: Date;
  launched: Date;
  completed: Date;
  type: string;
  id: string;
  target: string;
  completionStatus: string;
  total: string;
  optimizedAggregation: string;
  optimized: string;
  updated: string;
  runTimeMinuets: number;
  message: string;
}
