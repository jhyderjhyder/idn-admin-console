import { Component, OnInit } from '@angular/core';
import { IDNService } from '../service/idn.service';
import { Reassignment } from '../model/reassignment';

@Component({
    selector: 'app-reassignments',
    templateUrl: './reassignments.component.html',
    styleUrls: ['./reassignments.component.css'],
    standalone: false
})
export class ReassignmentsComponent implements OnInit {
  constructor(private idnService: IDNService) {}
  listReassignments: Array<Reassignment>;
  loading: Boolean;
  searchText: string;

  ngOnInit() {
    this.listReassignments = [];
    this.idnService.getAllReassignments().subscribe(response => {
      const searchResult = response;
      for (let i = 0; i < searchResult.length; i++) {
        const raw = searchResult[i];
        const r = new Reassignment();
        const identity = raw['identity'];
        r.identityId = identity['id'];
        r.identityName = identity['name'];
        const config = raw['configDetails'];
        for (let c = 0; c < config.length; c++) {
          const rawconfig = config[c];
          r.configType = rawconfig['configType'];
          r.startDate = rawconfig['startDate'];
          r.endDate = rawconfig['endDate'];
          const target = rawconfig['targetIdentity'];
          r.targetId = target['id'];
          r.targetName = target['name'];
          this.listReassignments.push(r);
        }
      }
    });
    this.loading = false;
  }
}
