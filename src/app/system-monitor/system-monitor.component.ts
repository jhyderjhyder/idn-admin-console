import { Component, OnInit } from '@angular/core';
import { VaConfig } from '../model/va-config';
//import { MessageService } from '../service/message.service';
import { IDNService } from '../service/idn.service';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { AuthenticationService } from '../service/authentication-service.service';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';

@Component({
    selector: 'app-system-monitor',
    templateUrl: './system-monitor.component.html',
    styleUrls: ['./system-monitor.component.css'],
    standalone: false
})
export class SystemMonitorComponent implements OnInit {
  cluster: VaConfig[];
  loading: boolean;

  vaGood: number;
  vaWarning: number;
  vaError: number;

  clusterError: number;
  clusterGood: number;
  clusterWarning: number;
  zip: JSZip = new JSZip();
  searchText: string;

  constructor(
    private idnService: IDNService,
    private authenticationService: AuthenticationService
  ) {}
  ngOnInit() {
    this.getStatus();
  }

  getStatus() {
    this.cluster = [];

    this.clusterError = 0;
    this.clusterGood = 0;
    this.clusterWarning = 0;

    this.vaGood = 0;
    this.vaError = 0;
    this.vaWarning = 0;

    this.loading = true;
    this.idnService.getAllVAClusters().subscribe(async clusters => {
      for (const each of clusters) {
        if (each.status == 'NORMAL') {
          this.clusterGood++;
        } else {
          if (each.status == 'WARNING') {
            this.clusterWarning++;
          } else {
            this.clusterError++;
          }
        }

        this.idnService
          .getClusterDetails(each.id)
          .subscribe(async clusterDetails => {
            if (clusterDetails.clientsStatus.length == 0) {
              const c = new VaConfig();
              c.id = each.id;
              c.name = each.name;
              c.ccgVersion = each.ccgVersion;
              c.status = each.status;
              c.description = each.description;
              c.clientStatus = 'NONE';
              this.cluster.push(c);
            }
            for (const d of clusterDetails.clientsStatus) {
              const c = new VaConfig();
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
              if (c.clientStatus == 'NORMAL') {
                this.vaGood++;
              } else {
                if (c.clientStatus == 'WARN') {
                  //Not sure if clients have warnings
                  this.vaWarning++;
                } else {
                  this.vaError++;
                }
              }
              this.cluster.push(c);
            }
          });
      }

      this.loading = false;
    });
  }

  download() {
    const jsonData = JSON.stringify(this.cluster, null, 4);
    const fileName = 'vaDetails.json';
    this.zip.file(`${fileName}`, jsonData);

    const currentUser = this.authenticationService.currentUserValue;
    const zipFileName = `${currentUser.tenant}-vaDetails.zip`;

    this.zip.generateAsync({ type: 'blob' }).then(function (content) {
      saveAs(content, zipFileName);
    });
  }

  saveInCsv() {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useHeader: true,
      headers: [
        'id',
        'name',
        'ccgVersion',
        'status',
        'description',
        'clientid',
        'clientStatus',
        'clientHypervisor',
        'clientVersion',
        'clientIp',
        'clientHostName',
      ],
      nullToEmptyString: true,
    };

    const currentUser = this.authenticationService.currentUserValue;
    const fileName = `${currentUser.tenant}-vaDetails`;

    const arr = [];
    for (const each of this.cluster) {
      const record = Object.assign(each);
      arr.push(record);
    }

    new AngularCsv(arr, fileName, options);
  }
}
