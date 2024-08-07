import { Component, OnInit, ViewChild } from '@angular/core';
import { BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';
import { Source } from '../model/source';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { AuthenticationService } from '../service/authentication-service.service';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { prettyPrintJson } from 'pretty-print-json';
import { JsonFormatOptions } from '../model/json-format-options';
import { PageResults } from '../model/page-results';

@Component({
  selector: 'app-source-info',
  templateUrl: './source-info.component.html',
  styleUrls: ['./source-info.component.css'],
})
export class SourceInfoComponent implements OnInit {
  hidePageOption: boolean;
  sources: Source[];
  searchText: string;
  loading: boolean;
  exporting: boolean;
  loadedCount: number;
  sourceCount: number;
  allSources: any;
  rawObject: string;
  rawObjectId: string;
  rawProvisioningId: string;
  tagSource: Source;
  newTagName: string;
  clearButton: boolean;
  page: PageResults;

  zip: JSZip = new JSZip();

  invalidMessage: string[];

  public modalRef: BsModalRef;
  @ViewChild('addTagModal', { static: false })
  addTagModal: ModalDirective;

  constructor(
    private idnService: IDNService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService
  ) {}

  hideResetSourceBothConfirmModal() {
    this.addTagModal.hide();
  }

  ngOnInit() {
    this.hidePageOption = false;
    this.page = new PageResults();
    this.page.limit = 100;
    this.reset(true);

    this.search();
  }

  reset(clearMsg: boolean) {
    this.rawObject = null;
    this.rawObjectId = null;
    this.rawProvisioningId = null;
    this.searchText = null;
    this.clearButton = false;
    this.sources = null;
    this.loading = false;
    this.exporting = false;
    this.loadedCount = null;
    this.sourceCount = null;
    this.allSources = null;
    this.invalidMessage = [];
    if (clearMsg) {
      this.messageService.clearAll();
    }
    this.rawObjectId = null;
    document.getElementById('jsonRaw').innerHTML = '';
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

  search() {
    this.sources = [];
    this.searchShared();
  }

  searchAll() {
    this.sources = [];
    this.hidePageOption = true;
    this.getOnePage(1);
    while (this.page.hasMorePages) {
      this.loading = true;
      this.loadedCount = 0;
      this.sourceCount = this.page.limit;
      this.getNextPage();
    }
  }

  sort() {
    this.allSources.sort((a, b) => a.name.localeCompare(b.name));
  }

  searchShared() {
    this.loading = true;
    this.idnService.getAllSourcesPaged(this.page).subscribe(async response => {
      const allSources = response.body;
      const headers = response.headers;
      this.page.xTotalCount = headers.get('X-Total-Count');

      this.sourceCount = allSources.length;
      this.allSources = allSources;

      //Sort it alphabetically
      allSources.sort((a, b) => a.name.localeCompare(b.name));

      let index = 0;
      for (const each of allSources) {
        if (index > 0 && index % 10 == 0) {
          // After processing every batch (10 sources), wait for 1 second before calling another API to avoid 429
          // Too Many Requests Error
          await this.sleep(1000);
        }
        index++;

        const source = new Source();
        source.name = each.name;
        //source.labels = each.labels;
        source.id = each.id;
        this.idnService.getTags('SOURCE', source.id).subscribe(myTag => {
          if (myTag != null) {
            source.labels = myTag.tags;
          } else {
            source.labels = ['none'];
          }
        });
        source.cloudExternalID = each.connectorAttributes.cloudExternalId;
        source.cloudDisplayName = each.connectorAttributes.cloudDisplayName;
        if (source.cloudDisplayName == source.name) {
          source.cloudDisplayName = '';
        }

        source.description = each.description;
        if (each.description.length > 10) {
          source.description = each.description.slice(0, 10) + '...';
        }

        source.type = each.type;
        source.authoritative = each.authoritative;

        if (source.authoritative) {
          source.name = source.name + ' (Authoritative)';
        }

        this.idnService.getSourceV3Api(source.id).subscribe(
          searchResult => {
            source.schemaCount = searchResult.schemas.length;
            source.lastAggregationDate =
              searchResult.connectorAttributes.lastAggregationDate_account;
            source.internalName = searchResult.healthy;
          },
          err => {
            this.messageService.handleIDNError(err);
          }
        );

        this.sources.push(source);
        this.loadedCount = this.sources.length;
      }
      this.loading = false;
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  //Show the full content of object in questions
  editJson(input: Source) {
    for (const each of this.allSources) {
      if (each.id == input.id) {
        this.rawObject = JSON.stringify(each, null, 4);
        this.rawObjectId = input.id;
        this.clearButton = true;
      }
    }
  }

  editJsonProvisioningPolicy(input: Source) {
    for (const each of this.allSources) {
      if (each.id == input.id) {
        this.idnService.getSourceV3ProvisioningPolicy(each.id).subscribe(
          searchResult => {
            this.rawObject = JSON.stringify(searchResult, null, 4);
          },
          err => {
            this.messageService.handleIDNError(err);
          }
        );

        this.rawObjectId = input.id;
        this.rawProvisioningId = 'Working on it';
        this.clearButton = true;
      }
    }
  }

  viewJson(input: Source) {
    for (const each of this.allSources) {
      if (each.id == input.id) {
        //this.rawObject = JSON.stringify(each, null, 4);
        this.rawObjectId = input.id;
        const options: JsonFormatOptions = new JsonFormatOptions();
        options.lineNumbers = false;
        options.quoteKeys = true;

        //https://github.com/center-key/pretty-print-json
        const html = prettyPrintJson.toHtml(each, options);
        const elem = document.getElementById('jsonRaw');
        elem.innerHTML = html;
        this.clearButton = true;
      }
    }
  }

  addSourceTag(input: Source) {
    this.tagSource = input;
    this.addTagModal.show();
  }
  addNewTag() {
    //addTag(type:string, id:string, name:string, tag:string):
    console.log(this.newTagName);
    this.idnService
      .addTag('SOURCE', this.tagSource.id, this.tagSource.name, this.newTagName)
      .subscribe(searchResult => {
        console.log(searchResult);
        this.addTagModal.hide();
        this.ngOnInit();
      });
  }

  removeAllTag() {
    //addTag(type:string, id:string, name:string, tag:string):
    console.log(this.newTagName);
    this.idnService
      .deleteTag('SOURCE', this.tagSource.id)
      .subscribe(searchResult => {
        console.log(searchResult);
        this.addTagModal.hide();
        this.ngOnInit();
      });
  }

  cancelTag() {
    this.addTagModal.hide();
  }

  clearJsonRaw() {
    const elem = document.getElementById('jsonRaw');
    elem.innerHTML = null;
    this.rawObjectId = null;
    this.rawObject = null;
    this.clearButton = false;
  }

  testConnection(input: Source) {
    const elem = document.getElementById('jsonRaw');
    elem.innerHTML = null;
    for (const each of this.allSources) {
      if (each.id == input.id) {
        this.idnService.getSourceTest(each.id).subscribe(searchResult => {
          const options: JsonFormatOptions = new JsonFormatOptions();
          options.lineNumbers = false;
          options.quoteKeys = true;
          //https://github.com/center-key/pretty-print-json
          const html = prettyPrintJson.toHtml(searchResult, options);

          const elem = document.getElementById('jsonRaw');
          elem.innerHTML = html;
          if (searchResult.status != null) {
            window.alert(searchResult.status);
          }
        });
      }
    }
  }

  viewJsonProvisioningPolicy(input: Source) {
    this.clearButton = true;
    for (const each of this.allSources) {
      if (each.id == input.id) {
        //this.rawObject = JSON.stringify(each, null, 4);
        this.rawObjectId = input.id;
        const options: JsonFormatOptions = new JsonFormatOptions();
        options.lineNumbers = false;
        options.quoteKeys = true;
        options.trailingComma = false;

        this.idnService.getSourceV3ProvisioningPolicy(each.id).subscribe(
          searchResult => {
            //https://github.com/center-key/pretty-print-json
            const html = prettyPrintJson.toHtml(searchResult, options);
            const elem = document.getElementById('jsonRaw');
            elem.innerHTML = html;
          },
          err => {
            this.messageService.handleIDNError(err);
          }
        );
      }
    }
  }

  save() {
    const rawData = (
      document.getElementById('userUpdatedObject') as HTMLInputElement
    ).value;
    try {
      if (this.rawProvisioningId != null) {
        const data = JSON.parse(rawData);

        this.idnService
          .updateProvisioningPlan(data, this.rawObjectId)
          .subscribe(
            searchResult => {
              alert('Save ProvisioningPolicy Success');
              console.log(searchResult);
            },
            err => {
              this.messageService.handleIDNError(err);
              alert('Cant Save ProvisioningPolicy');
            }
          );
      } else {
        const data = JSON.parse(rawData);

        this.idnService.updateSource(data, this.rawObjectId).subscribe(
          searchResult => {
            alert('Save Success');
            console.log(searchResult);
          },
          err => {
            this.messageService.handleIDNError(err);
            alert('Cant Save');
          }
        );
      }
    } catch (err) {
      alert('Json Invalid:' + err);
    }
  }

  exportAllSources() {
    this.exporting = true;

    // Get the already fetched this.allSources to export since its in a single page
    for (const each of this.allSources) {
      const source = new Source();
      const jsonData = JSON.stringify(each, null, 4);
      source.name = each.name;
      const fileName = 'Source - ' + source.name + '.json';
      this.zip.file(`${fileName}`, jsonData);
    }

    const currentUser = this.authenticationService.currentUserValue;
    const zipFileName = `${currentUser.tenant}-sources.zip`;

    this.zip.generateAsync({ type: 'blob' }).then(function (content) {
      saveAs(content, zipFileName);
    });
    this.exporting = false;
  }
}
