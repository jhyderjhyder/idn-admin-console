import { Component, OnInit } from '@angular/core';
import { BasicAttributes } from '../model/basic-attributes';
import { IDNService } from '../service/idn.service';
import { SimpleQueryCondition } from '../model/simple-query-condition';
//import { MessageService } from '../service/message.service';
import { Role } from '../model/role';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';
import { PageResults } from '../model/page-results';
import { SourceOwner } from '../model/source-owner';

@Component({
  selector: 'app-role-contains-ent',
  templateUrl: './role-contains-ent.component.html',
  styleUrls: ['./role-contains-ent.component.css'],
  standalone: false
})
export class RoleContainsEntComponent implements OnInit {
  constructor(private idnService: IDNService) { }
  filterApplications: Array<BasicAttributes>;
  sourceName: string;
  entName: string;
  selectedFilterTypes: string;
  entList: Array<BasicAttributes>;
  max: boolean;
  rubyCSV: Array<rubyImport>;
  rubyCSVsize: number;

  roles: Array<Role>;

  ngOnInit(): void {
    this.getApplicationNames();
    this.sourceName = 'ALL';
    this.max = false;
  }

  submit() {
    this.rubyCSV = [];
    this.rubyCSVsize = 0;
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
              r.owner = new SourceOwner();
              r.owner.displayName = roleRaw.owner.name;
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
    const pr = new PageResults();
    pr.limit = 50;
    this.filterApplications = new Array<BasicAttributes>();
    const all = new BasicAttributes();
    all.name = 'ALL';
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

  saveInCsv() {
    const options = {
      fieldSeparator: ',',
      quoteStrings: ' ',
      decimalseparator: '.',
      showLabels: true,
      useHeader: true,
      headers: ['name', 'owner', 'description', 'shortDescription'],
      nullToEmptyString: true,
    };

    //const fileName = `rolesContaining-${this.entName}`;


    new AngularCsv(this.roles, 'rolesContaining', options);
  }


  async buildEntitlementList(input) {
    this.rubyCSV = [];
    this.rubyCSVsize = 0;
    const role = this.roles[input];

    let entPK = [];
    await this.idnService.getRoleByName(role.name).subscribe(response => {
      this.rubyCSVsize = response[0].entitlements.length;
      for (const d of response[0].entitlements) {
        entPK.push[d.id];
        this.idnService.getEntitlement(d.id).subscribe(dResponse => {
          let r = new rubyImport();
          r.role_name = role.name;
          r.role_description = d.description;
          r.role_owner = role.owner.displayName;
          
          r.applicationName = dResponse.source.name;
          r.attribute = dResponse.attribute;
          r.sourceSchemaObjectType = dResponse.sourceSchemaObjectType;
          r.description = dResponse.description;
          if (r.description) {
            r.description = r.description.replace(/[\r\n]/g, '');
          }
          
          r.value = dResponse.value;
          r.add_entitlements = r.applicationName + ":" + r.attribute + ":" + r.value
          console.log(dResponse);
          this.rubyCSV.push(r);
        });

      }
    });
  }

  async saveEntitlementData(input) {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useHeader: true,
      headers: ['applicationName', 'attribute', 'value', 'description', 'sourceSchemaObjectType'],
      nullToEmptyString: true,
    };
    const role = this.roles[input];
    const fileName = `entitlementExtract-${role.name}`;
    new AngularCsv(this.rubyCSV, 'rubyExtract-' + fileName, options);
    this.rubyCSVsize=0;
    this.rubyCSV = [];

  };


  async saveRubyData(input) {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useHeader: true,
      headers: ['operation_name', 'role_name', 'role_description', 'role_disabled', 'role_owner',
        'access_profiles', 'add_entitlements', 'remove_entitlements',
        'is_role_requestable', 'access_request_approval_schema', 'denied_comments_required',
        'request_comments_required', 'revoke_request_approval_schemes', 'tags'
      ],
      nullToEmptyString: true,
    };
    const role = this.roles[input];
    const fileName = `rubyExtract${role.name}`;
    new AngularCsv(this.rubyCSV, fileName, options);
    this.rubyCSVsize=0;
    this.rubyCSV = [];

  };


}
class rubyImport {
  operation_name: string = "createRole"
  role_name: string;
  role_description: string;
  role_disabled: string = "FALSE";
  role_owner: string;
  access_profiles: string = "";
  add_entitlements: string;
  remove_entitlements: string = "";
  is_role_requestable: string = "TRUE";
  access_request_approval_schema: string = "MANAGER";
  denied_comments_required: string = "TRUE";
  request_comments_required: string = "TRUE";
  revoke_request_approval_schemes: string = "MANAGER";
  tags: string;
  applicationName: string;
  attribute: string;
  value: string;
  description: string;
  sourceSchemaObjectType: string
} 