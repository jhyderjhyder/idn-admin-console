import { Component, OnInit } from '@angular/core';
import { IDNService } from '../service/idn.service';

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

  constructor(
    private idnService: IDNService,
  ) { }
  ngOnInit() {
    this.vaGood = 0;
    this.vaError = 0;
    this.vaHealth();
    this.circuitBreakerSet = new Set();
    this.getCBSources();
 

  }
  private vaHealth(){
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
  private getCBSources(){
   
    this.idnService.getTaskStatus("WARNING").subscribe(response => {
      for (const each of response) {
        if (each.messages){
          let data = JSON.stringify(each.messages);
          if (data.includes("Account deletion was skipped")){
            this.circuitBreakerSet.add(each.target.name);
          }
        }
        
      }
      //this.tasks = response;
    });
  
  }

}
