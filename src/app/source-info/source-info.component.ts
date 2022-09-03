import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Papa } from 'ngx-papaparse';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Source } from '../model/source';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { AuthenticationService } from '../service/authentication-service.service';

@Component({
  selector: 'app-source-info',
  templateUrl: './source-info.component.html',
  styleUrls: ['./source-info.component.css']
})
export class SourceInfoComponent implements OnInit {
  sources: Source[];
  searchText: string;
  loading: boolean;

  invalidMessage: string[];

  public modalRef: BsModalRef;

  constructor(private papa: Papa,
    private idnService: IDNService, 
    private messageService: MessageService,
    private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    this.reset(true);
    this.search();
  }

  reset(clearMsg: boolean) {
    this.sources = null;
    this.loading = false;
    this.invalidMessage = [];
    if (clearMsg) {
      this.messageService.clearAll();
    } 
  }

  search() {
    this.loading = true;
    this.idnService.searchAggregationSources()
          .subscribe(allSources => {
            this.sources = [];
            for (let each of allSources) {
              let source = new Source();
              source.id = each.id;
              source.cloudExternalID = each.connectorAttributes.cloudExternalId;
              source.name = each.name;
              source.description = each.description;
              source.type = each.type;
              source.authoritative = each.authoritative;

              if (source.authoritative) {
                source.name = source.name + " (Authoritative)";
              }

              this.idnService.getSourceCCApi(source.cloudExternalID)
              .subscribe(
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

}
