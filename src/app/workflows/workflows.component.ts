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
  rawObjectID: string;
  rawObject: string;
  unformatedRawObject: object;
  rawObjectName: string;
  workflows: Array<Workflow>;
  executions: Array<object>;
  type: string;
  executionsID: string;
  searchText: string;
  faildOnly: boolean;

  constructor(private idnService: IDNService) {}
  ngOnInit(): void {
    this.page = new PageResults();
    this.page.limit = 200;
    this.faildOnly = false;
    this.getAllWorkflows();
  }

  /**
   * Copy these three functions to any
   * page you want to have paggination
   */
  //Get the next page
  getNextPage() {
    this.page.nextPage;
    this.getAllExecutions(this.executionsID, this.faildOnly);
  }
  //Get the previous page
  getPrevPage() {
    this.page.prevPage;
    this.getAllExecutions(this.executionsID, this.faildOnly);
  }
  //Pick the page Number you want
  getOnePage(input) {
    this.page.getPageByNumber(input - 1);
    this.getAllExecutions(input - 1, this.faildOnly);
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
          w.name = each.name.trim();
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
      //this.workflows = details;
    });

    //this.workflows.sort();
  }

  clear() {
    this.type = 'executions';
    this.rawObject = null;
    const elem = document.getElementById('jsonRaw');
    elem.innerHTML = null;
  }

  getAllExecutions(id, faildOnly) {
    this.faildOnly = faildOnly;
    this.executionsID = id;
    this.type = 'executions';
    this.loading = true;
    this.rawObjectID = null;
    this.rawObject = null;
    const elem = document.getElementById('jsonRaw');
    elem.innerHTML = null;
    this.idnService
      .getWorkflowExecutions(this.page, id, faildOnly)
      .subscribe(response => {
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
    this.unformatedRawObject = null;
    this.idnService.getWorkflowExecutionsDetails(id).subscribe(response => {
      const results = response.body;
      const options: JsonFormatOptions = new JsonFormatOptions();
      options.lineNumbers = false;
      options.quoteKeys = true;

      //const obj = JSON.stringify(results, null, 4);
      const html = prettyPrintJson.toHtml(results, options);
      this.rawObject = results;
      this.unformatedRawObject = results;
      this.rawObjectName = id;
      const elem = document.getElementById('jsonRaw');
      elem.innerHTML = html;

      this.loading = false;
    });
    //this.workflows.sort();
  }

  download() {
    const json = JSON.stringify(this.unformatedRawObject, null, 4);
    //const json = this.rawObject;
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    let value = this.rawObjectName;
    if (value == null) {
      value = 'empty';
    }
    a.download = this.type + '_' + value + '.json';
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
    let object = null;
    for (const w of this.workflows) {
      if (w.id === id) {
        object = w;
      }
    }
    const html = prettyPrintJson.toHtml(object, options);
    this.rawObject = JSON.stringify(object, null, 4);
    this.rawObjectName = object.name;
    this.unformatedRawObject = object;
    const elem = document.getElementById('jsonRaw');
    elem.innerHTML = html;
    //this.workflows.sort();
  }
}
