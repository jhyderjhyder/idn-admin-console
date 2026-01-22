import { Component, OnInit } from '@angular/core';
import { IDNService } from '../service/idn.service';
import { BasicAttributes } from '../model/basic-attributes';
import { PageResults } from '../model/page-results';

@Component({
  selector: 'app-health-dashboard',
  templateUrl: './health-dashboard.component.html',
  styleUrl: './health-dashboard.component.css',
  standalone: false
})


export class HealthDashboardComponent implements OnInit {

  vaGood: number;
  vaError: number;
  circuitBreakerSet: Set<String>;
  failedSet: Set<String>;
  workingApplication: Array<BasicAttributes>;
  failingWithTag: Array<BasicAttributes>;
  failingWithOutTag: Array<BasicAttributes>;
  totalApps: Number;

  constructor(
    private idnService: IDNService,
  ) { }
  ngOnInit() {
    this.vaGood = 0;
    this.vaError = 0;
    this.vaHealth();
    this.circuitBreakerSet = new Set();
    this.failedSet = new Set();
    this.getCBSources();
    this.getFailSources();
    this.getApplicationNames();


  }
  private vaHealth() {
    this.idnService.getAllVAClusters().subscribe(async clusters => {
      for (const each of clusters) {
        if (each.status == 'NORMAL') {
          this.vaGood++;
        } else {
          this.vaError++;
        }
      }
    });
  }
  private getCBSources() {
    this.idnService.getTaskStatus("WARNING").subscribe(response => {
      for (const each of response) {
        if (each.messages) {
          let data = JSON.stringify(each.messages);
          if (data.includes("Account deletion was skipped")) {
            this.circuitBreakerSet.add(each.target.name);
          }
        }

      }
      //this.tasks = response;
    });
  }

  private getFailSources() {
    this.idnService.getTaskStatus("ERROR").subscribe(response => {
      for (const each of response) {
        if (each.uniqueName != null && each.uniqueName.startsWith("Cloud Account Aggregation")) {
          this.failedSet.add(each.target.name);
        }
      }
      //this.tasks = response;
    });
  }
   async getApplicationNames() {
      const pr = new PageResults();
      pr.limit = 1;
      this.workingApplication = new Array<BasicAttributes>();
      this.failingWithOutTag = new Array<BasicAttributes>();
      this.failingWithTag = new Array<BasicAttributes>();
      
      this.idnService.getAllSourcesPaged(pr, null).subscribe(async response => {
        const headers = response.headers;
        pr.xTotalCount = headers.get('X-Total-Count');
        this.totalApps = pr.xTotalCount;

          console.log('loading applications');
          let max = 0;
          pr.limit = 250;
  
          await new Promise(resolve => {
            while (pr.totalPages >= max && max < 100) {
              console.log('Start while:' + max);
              this.idnService.getAllSourcesPaged(pr, null).subscribe(response => {
                const searchResult = response.body;
                for (let i = 0; i < searchResult.length; i++) {
                  const app = searchResult[i];
                  const basic = new BasicAttributes();
                  basic.name = app['name'];
                  basic.value = app['id'];
                  if (app.connectorAttributes!=null && app.connectorAttributes.status!=null){
                    if (app.connectorAttributes.status.toString().startsWith("SOURCE_STATE_HEALTHY")){
                      this.workingApplication.push(basic);
                    }else{
                      this.idnService.getTags('SOURCE', app.id).subscribe(myTag => {
                      if (myTag != null && myTag.tags.length>0) {
                        console.log(app.name + ":" + myTag.tags.length)
                        this.failingWithTag.push(basic);
                      } else {
                        this.failingWithOutTag.push(basic);
                      }
                    });
                      
                    }
                  }else{
                    console.log(app);
                  }
                  
                  
                }
              });
  
              max++;
              pr.nextPage;
              resolve;
            }
          });
        
      });
    }

}
