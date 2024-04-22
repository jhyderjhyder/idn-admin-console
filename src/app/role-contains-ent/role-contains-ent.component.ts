import { Component, OnInit } from '@angular/core';
import { BasicAttributes } from '../model/basic-attributes';
import { IDNService } from '../service/idn.service';
import { SimpleQueryCondition } from '../model/simple-query-condition';
//import { MessageService } from '../service/message.service';
import { Role } from '../model/role';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';

@Component({
  selector: 'app-role-contains-ent',
  templateUrl: './role-contains-ent.component.html',
  styleUrls: ['./role-contains-ent.component.css'],
})
export class RoleContainsEntComponent implements OnInit {
  constructor(private idnService: IDNService) {}
  filterApplications: Array<BasicAttributes>;
  sourceName: string;
  entName: string;
  selectedFilterTypes: string;
  entList: Array<BasicAttributes>;
  max: boolean;

  roles: Array<Role>;

  ngOnInit(): void {
    this.getApplicationNames();
    this.sourceName = 'ALL';
    this.max = false;
  }

  submit() {
    this.max = false;
    this.roles = new Array<Role>();
    const query = new SimpleQueryCondition();
    query.attribute = this.sourceName;
    query.value = this.entName;

    //Loop the array of application names looking for the ID# of the source
    for (let i = 0; i < this.filterApplications.length; i++) {
      const b = this.filterApplications[i];
      if (b.name == this.sourceName) {
        query.attribute = b.value;
      }
    }
    this.idnService.searchEntitlements(query).subscribe(response => {
      this.entList = new Array<BasicAttributes>();
      for (let i = 0; i < response.length; i++) {
        if (i >= 4) {
          this.max = true;
        }
        const app = response[i];
        const basic = new BasicAttributes();
        basic.name = app.source.name + '--' + app.name;
        basic.value = app['id'];
        this.entList.push(basic);
        this.idnService
          .rolesContainingOneEntitlement(app['id'])
          .subscribe(rolesDetails => {
            for (let ii = 0; ii < rolesDetails.length; ii++) {
              const roleRaw = rolesDetails[ii];
              const r = new Role();
              r.name = roleRaw.name;
              r.owner = roleRaw.owner.name;
              r.description = roleRaw.description;
              r.shortDescription = app.source.name + '--' + app.name;
              this.roles.push(r);
            }
          });
      }
    });
  }
  /**
   * Get all the application names and id numbers
   */
  getApplicationNames() {
    this.filterApplications = new Array<BasicAttributes>();
    const all = new BasicAttributes();
    all.name = 'ALL';
    all.value = '';
    this.filterApplications.push(all);

    this.idnService.getAllSources().subscribe(response => {
      const searchResult = response;
      for (let i = 0; i < searchResult.length; i++) {
        const app = searchResult[i];
        const basic = new BasicAttributes();
        basic.name = app['name'];
        basic.value = app['id'];
        this.filterApplications.push(basic);
   
      }
    });
  }

  saveInCsv() {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useHeader: true,
      headers: ['name', 'owner', 'description', 'shortDescription'],
      nullToEmptyString: true,
    };

    //const fileName = `rolesContaining-${this.entName}`;

    new AngularCsv(this.roles, 'rolesContaining', options);
  }
}
