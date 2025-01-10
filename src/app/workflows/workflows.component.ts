import { Component, OnInit } from '@angular/core';
import { PageResults } from '../model/page-results';
import { IDNService } from '../service/idn.service';
import { JsonFormatOptions } from '../model/json-format-options';
import { prettyPrintJson } from 'pretty-print-json';
import { Workflow } from '../model/workflow';

@Component({
  selector: 'app-workflows',
  templateUrl: './workflows.component.html',
  styleUrls: ['./workflows.component.css'],
})
export class WorkflowsComponent implements OnInit {
  page: PageResults;
  loading: boolean;
  rawObjectID: String;
  rawObject: String;
  workflows: Array<Workflow>;
  executions: Array<object>;
  type: String;

  constructor(private idnService: IDNService) {}
  ngOnInit(): void {
    this.page = new PageResults();
    this.page.limit = 200;
    this.getAllWorkflows();
  }

  getAllWorkflows() {
    this.rawObject = null;
    const elem = document.getElementById('jsonRaw');
    elem.innerHTML = null;
    this.type = 'workflows';
    this.loading = true;
    this.rawObjectID = null;
    this.rawObject = null;
    this.idnService.getWorkflows(this.page).subscribe(response => {
      const results = response.body;
      const headers = response.headers;

      this.page.xTotalCount = headers.get('X-Total-Count');
      this.workflows = new Array();
      if (Array.isArray(results)) {
        for (const each of results) {
          const w = new Workflow();
          w.id = each.id;
          w.name = each.name;
          w.description = each.description;
          w.created = each.created;
          w.modified = each.modified;
          w.enabled = each.enabled;
          w.executionCount = each.executionCount;
          w.failureCount = each.failureCount;
          if (each.trigger) {
            w.type = each.trigger.type;
          }
          w.definition = each.definition;

          this.workflows.push(w);
        }
      }
      this.loading = false;
      this.workflows.sort((a, b) => a.name.localeCompare(b.name));
    });

    //this.workflows.sort();
  }

  clear() {
    this.type = 'executions';
    this.rawObject = null;
    const elem = document.getElementById('jsonRaw');
    elem.innerHTML = null;
  }

  getAllExecutions(id) {
    this.type = 'executions';
    this.loading = true;
    this.rawObjectID = null;
    this.rawObject = null;
    const elem = document.getElementById('jsonRaw');
    elem.innerHTML = null;
    this.idnService.getWorkflowExecutions(this.page, id).subscribe(response => {
      const results = response.body;
      const headers = response.headers;

      this.page.xTotalCount = headers.get('X-Total-Count');
      this.executions = new Array();
      if (Array.isArray(results)) {
        for (const each of results) {
          //TODO cleanup the object
          this.executions.push(each);
        }
      }
      this.loading = false;
    });
    //this.workflows.sort();
  }

  getAllExecutionDetails(id) {
    this.type = 'details';
    this.loading = true;
    this.rawObjectID = null;
    this.rawObject = null;
    this.idnService.getWorkflowExecutionsDetails(id).subscribe(response => {
      const results = response.body;
      const options: JsonFormatOptions = new JsonFormatOptions();
      options.lineNumbers = false;
      options.quoteKeys = true;

      //const obj = JSON.stringify(results, null, 4);
      const html = prettyPrintJson.toHtml(results, options);
      this.rawObject = results;
      const elem = document.getElementById('jsonRaw');
      elem.innerHTML = html;

      this.loading = false;
    });
    //this.workflows.sort();
  }
  download() {
    const json = JSON.stringify(this.rawObject, null, 4);
    //const json = this.rawObject;
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Workflowdetails.json';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  showWorkflowDetails(id) {
    this.type = 'details';
    this.loading = true;
    this.rawObjectID = null;
    this.rawObject = null;
    const options: JsonFormatOptions = new JsonFormatOptions();
    options.lineNumbers = false;
    options.quoteKeys = true;

    const html = prettyPrintJson.toHtml(this.workflows[id], options);
    this.rawObject = JSON.stringify(this.workflows[id], null, 4);
    const elem = document.getElementById('jsonRaw');
    elem.innerHTML = html;
    //this.workflows.sort();
  }
}
