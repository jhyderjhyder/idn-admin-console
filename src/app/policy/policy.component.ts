import { Component, OnInit } from '@angular/core';
import { IDNService } from '../service/idn.service';
import { PageResults } from '../model/page-results';
import { CommonModule } from '@angular/common';
import { PolicyRightLeft, SimplePolicy } from '../model/policy-right-left'
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';

@Component({
  selector: 'app-policy',
  imports: [CommonModule],
  templateUrl: './policy.component.html',
  styleUrl: './policy.component.css',
})
export class PolicyComponent implements OnInit {

  hidePageOption: boolean;
  page: PageResults;
  loading: boolean;
  appSearchText: string;
  policy: Array<SimplePolicy>;
  details: Array<PolicyRightLeft>;
  right: Array<PolicyRightLeft>;
  left: Array<PolicyRightLeft>;
  totalEntries: number;
  policyName:string;


  constructor(
    private idnService: IDNService,
  ) { }

  ngOnInit() {
    this.hidePageOption = false;

    this.reset();
  }

  reset() {
    this.policy = [];
    this.page = new PageResults();
    this.page.xTotalCount = 0;
    this.page.limit = 100;
    this.details = null;
  }

  search() {
    this.loading = true;
    this.idnService
      .getAllPoliciesPaged(this.page, this.appSearchText)
      .subscribe(response => {
        const allSources = response.body;
        const headers = response.headers;
        this.page.xTotalCount = headers.get('X-Total-Count');


        //Sort it alphabetically
        allSources.sort((a, b) => a.name.localeCompare(b.name));
        this.policy = [];
        for (const each of allSources) {
          let p = new SimplePolicy();
          p.name = each.name;
          p.description = each.description;
          p.rightleft = [];
          p.showDetails =true;
          if (each.conflictingAccessCriteria) {
            const conflict = each.conflictingAccessCriteria;
            //Check the rightSide
            if (conflict.leftCriteria) {
              if (conflict.leftCriteria.criteriaList) {
                const leftList = conflict.leftCriteria.criteriaList;
                if (leftList) {
                  for (const left of leftList) {
                    let rl = new PolicyRightLeft();
                    rl.side = "left";
                    rl.application = left.id;
                    rl.entitlement = left.name;
                    p.rightleft.push(rl);
                  }
                }
              }
            }
            //Now Right side
            if (conflict.rightCriteria) {
              if (conflict.rightCriteria.criteriaList) {
                const rightList = conflict.rightCriteria.criteriaList;
                if (rightList) {
                  for (const right of rightList) {
                    let rl = new PolicyRightLeft();
                    rl.side = "Right";
                    rl.application = right.id;
                    rl.entitlement = right.name;
                    p.rightleft.push(rl);
                  }
                }
              }
            }

          }else{
            p.showDetails=false;
          }
          this.policy.push(p);
        }


        this.loading = false;
      });
  }

  showDetails(input: number) {
    let data = this.policy[input];
    this.policyName = data.name
    this.details = [];
    this.right = [];
    this.left = [];
    this.totalEntries =0;
    for (const each of data.rightleft) {
      let one = new PolicyRightLeft();
      one.side = each.side;
      one.application = each.application;
      one.entitlement = each.entitlement;
      one.name = each.name;
      this.getFullDetails(one);
      this.totalEntries++;
    }
    console.log(this.details);
  }

    getEntitlementDetails(input) {
    this.idnService.getEntitlement(input).subscribe(data => {
      window.alert(data.source.name);
    });
  }

  getFullDetails(input: PolicyRightLeft) {
    this.idnService.getEntitlement(input.application).subscribe(data => {
      input.application = data.source.name;
      input.entitlement = data.name;
      this.details.push(input);
      if (input.side=="left"){
        this.left.push(input);
        this.left.sort((a,b) =>a.application.localeCompare(b.application));
      }else{
        this.right.push(input);
        this.right.sort((a,b) =>a.application.localeCompare(b.application));
      }
    });
  }

  clear() {
    this.details = null;
  }

  /**
* Copy these three functions to any
* page you want to have paggination
*/
  //Get the next page
  getNextPage() {
    this.page.nextPage;
    this.search();
  }
  //Get the previous page
  getPrevPage() {
    this.page.prevPage;
    this.search();
  }
  //Pick the page Number you want
  getOnePage(input) {
    this.page.getPageByNumber(input - 1);
    this.search();
  }

   save() {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useHeader: true,
      nullToEmptyString: true,
      headers: [
        "side",
        "application",
        "entitlement"

      ]
    };
      new AngularCsv(this.details, 'policyExtract-' + this.policyName, options);
  }
}
