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
  failedSetAccount: Set<String>;
  failedSetGroup: Set<String>;
  workingApplication: Array<BasicAttributes>;
  failingWithTag: Array<BasicAttributes>;
  failingWithOutTag: Array<BasicAttributes>;
  totalApps: Number;
  today: Date;

  constructor(
    private idnService: IDNService,
  ) { }
  ngOnInit() {
    this.vaGood = 0;
    this.vaError = 0;
    this.workingApplication = [];
    this.failingWithTag = [];
    this.failingWithOutTag = [];
    this.circuitBreakerSet = new Set();
    this.failedSetAccount = new Set();
    this.failedSetGroup = new Set();

    const maxHours = (24*60*60*1000);
    this.today = new Date(new Date().getTime()-maxHours);

    this.vaHealth();
    this.getCBSources();
    this.getFailSources();
    this.getApplicationNames();


  }

  public sort(){
   
    const circuitBreakerArray = Array.from(this.circuitBreakerSet);
    circuitBreakerArray.sort;
    this.circuitBreakerSet = new Set(circuitBreakerArray);

    const failedSetAccountArray = Array.from(this.failedSetAccount);
    failedSetAccountArray.sort();
    this.failedSetAccount = new Set(failedSetAccountArray);

    const failedSetGroupArray = Array.from(this.failedSetGroup);
    failedSetGroupArray.sort();
    this.failedSetGroup = new Set(failedSetGroupArray);

    this.workingApplication.sort((a, b) => a.name.localeCompare(b.name));
    this.failingWithTag.sort((a, b) => a.name.localeCompare(b.name));
    this.failingWithOutTag.sort((a, b) => a.name.localeCompare(b.name));
  }

  private vaHealth() {
       this.idnService.getAllVAClusters().subscribe(async clusters => {
          for (const each of clusters) {
            this.idnService
              .getClusterDetails(each.id)
              .subscribe(async clusterDetails => {

                for (const d of clusterDetails.clientsStatus) {
                  if (d.status == 'NORMAL') {
                    this.vaGood++;
                  } else {
                      this.vaError++;
                    }
                }
              });
            
          }
    
        });
      
  }
  private getCBSources() {
    this.idnService.getTaskStatus("WARNING").subscribe(response => {
      
      for (const each of response) {
        let created = new Date();
        created = new Date(each.created);
        if (created.getTime()>this.today.getTime()){
          if (each.messages) {
            let data = JSON.stringify(each.messages);
            if (data.includes("Account deletion was skipped")) {
              this.circuitBreakerSet.add(each.target.name);
            }
          }
        }

      }
      //this.tasks = response;
    });
  }

  private getFailSources() {

    this.idnService.getTaskStatus("ERROR").subscribe(response => {
      for (const each of response) {
        let created = new Date();
        created = new Date(each.created);
        if (created.getTime()>this.today.getTime()){
          if (each.uniqueName != null && each.uniqueName.includes("Account Aggregation")) {
            this.failedSetAccount.add(each.target.name);
          }
          if (each.uniqueName != null && each.uniqueName.includes("Group Aggregation")) {
            this.failedSetGroup.add(each.target.name);
          }
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
