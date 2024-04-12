import { Component, OnInit } from '@angular/core';
import { VaConfig } from '../model/va-config';
//import { MessageService } from '../service/message.service';
import { IDNService } from '../service/idn.service';

@Component({
  selector: 'app-system-monitor',
  templateUrl: './system-monitor.component.html',
  styleUrls: ['./system-monitor.component.css'],
})
export class SystemMonitorComponent implements OnInit {
  cluster: VaConfig[];
  loading: boolean;
  vaIssues: number;
  clusterIssues: number;

  constructor(
    private idnService: IDNService // private messageService: MessageService
  ) {}
  ngOnInit() {
    console.log('Started Monitor');
    this.getStatus();
  }

  getStatus() {
    this.cluster = [];
    this.clusterIssues = 0;
    this.vaIssues = 0;
    this.loading = true;
    this.idnService.getAllVAClusters().subscribe(async clusters => {
      for (const each of clusters) {
        if (each.status != 'NORMAL') {
          this.clusterIssues++;
        }

        this.idnService
          .getClusterDetails(each.id)
          .subscribe(async clusterDetails => {
            if (clusterDetails.clientsStatus.length == 0) {
              var c = new VaConfig();
              c.id = each.id;
              c.name = each.name;
              c.ccgVersion = each.ccgVersion;
              c.status = each.status;
              c.description = each.description;
              c.clientStatus = 'NONE';
              this.cluster.push(c);
            }
            for (const d of clusterDetails.clientsStatus) {
              var c = new VaConfig();
              c.id = each.id;
              c.name = each.name;
              c.ccgVersion = each.ccgVersion;
              c.status = each.status;
              c.description = each.description;
              c.clientHypervisor = d.hypervisor;
              c.clientStatus = d.status;
              c.clientIp = d.internalIp;
              c.clientHostName = d.hostname;
              c.clientVersion = d.ccgVersion;
              if (c.clientStatus != 'NORMAL') {
                this.vaIssues++;
              }
              this.cluster.push(c);
            }
          });
      }

      this.loading = false;
    });
  }
}
