import { Component, OnInit } from '@angular/core';
import { IDNService } from '../service/idn.service';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';

@Component({
  selector: 'app-report-task-status',
  templateUrl: './report-task-status.component.html',
  styleUrls: ['./report-task-status.component.css'],
})
export class ReportTaskStatusComponent implements OnInit {
  constructor(private idnService: IDNService) {}

  tasks: [];
  filterType: string;
  filterOption: Array<String>;
  ngOnInit(): void {
    this.filterOption = new Array<String>();
    this.filterOption.push('ERROR');
    this.filterOption.push('SUCCESS');
    this.filterOption.push('RUNNING');

    this.filterType = 'ERROR';
    this.getData();
  }

  submit() {
    this.getData();
  }

  getData(): void {
    let filter = this.filterType;
    if (filter == 'RUNNING') {
      filter = null;
    }
    this.idnService.getTaskStatus(filter).subscribe(response => {
      this.tasks = response;
    });
  }

  saveInCsv() {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useHeader: true,
      nullToEmptyString: true,
    };

    const objects = new Array();

    for (let i = 0; i < this.tasks.length; i++) {
      const rp = {
        id: 'null',
        created: 'null',
        completed: 'null',
        description: 'null',
        unique: 'null',
        target: 'null',
        launcher: 'null',
        messages: 'null',
        attributes: 'null',
      };
      const item = this.tasks[i];
      rp.id = item['id'];
      rp.created = item['created'];
      rp.completed = item['completed'];
      rp.unique = item['uniqueName'];
      if (item['target'] != null) {
        rp.target = item['target']['name'];
      } else {
        rp.target = 'N/A';
      }
      rp.launcher = item['launcher'];
      rp.description = item['description'];
      let messageString = '';
      const messages: any[][] = item['messages'];
      if (messages != null) {
        for (let x = 0; x < messages.length; x++) {
          messageString = messageString + messages[x]['key'];
        }
      }
      rp.messages = messageString;

      rp.attributes = JSON.stringify(item['attributes']);
      objects.push(rp);
    }

    //const fileName = `rolesContaining-${this.entName}`;

    new AngularCsv(objects, 'tasks-' + this.filterType, options);
  }
}
