import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Source } from '../model/source';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { AuthenticationService } from '../service/authentication-service.service';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-source-info',
  templateUrl: './source-info.component.html',
  styleUrls: ['./source-info.component.css'],
})
export class SourceInfoComponent implements OnInit {
  sources: Source[];
  searchText: string;
  loading: boolean;
  exporting: boolean;

  zip: JSZip = new JSZip();

  invalidMessage: string[];

  public modalRef: BsModalRef;

  constructor(
    private idnService: IDNService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit() {
    this.reset(true);
    this.search();
  }

  reset(clearMsg: boolean) {
    this.sources = null;
    this.loading = false;
    this.exporting = true;
    this.invalidMessage = [];
    if (clearMsg) {
      this.messageService.clearAll();
    }
  }

  search() {
    this.loading = true;
    this.idnService.getAllSources().subscribe(allSources => {
      this.sources = [];
      for (const each of allSources) {
        const source = new Source();
        source.id = each.id;
        source.cloudExternalID = each.connectorAttributes.cloudExternalId;
        source.name = each.name;
        source.description = each.description;
        source.type = each.type;
        source.authoritative = each.authoritative;

        if (source.authoritative) {
          source.name = source.name + ' (Authoritative)';
        }

        this.idnService.getSourceCCApi(source.cloudExternalID).subscribe(
          searchResult => {
            source.accountsCount = searchResult.accountsCount;
            source.entitlementsCount = searchResult.entitlementsCount;
            source.internalName = searchResult.health.name;
          },
          err => {
            this.messageService.handleIDNError(err);
          }
        );

        this.sources.push(source);
      }
      this.loading = false;
    });
  }

  exportAllSources() {
    this.exporting = true;
    this.idnService.getAllSources().subscribe(results => {
      this.sources = [];
      for (const each of results) {
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
      this.ngOnInit();
    });
  }
}
