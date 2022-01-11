import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import xml2js from 'xml2js';
import { saveAs } from 'file-saver';
import { Papa } from 'ngx-papaparse';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Source } from '../model/source';
import { Rule } from '../model/rule';
import { SimpleQueryCondition } from '../model/simple-query-condition';
import { SourceOwner } from '../model/source-owner';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { AuthenticationService } from '../service/authentication-service.service';

@Component({
  selector: 'app-import-rule',
  templateUrl: './import-rule.component.html',
  styleUrls: ['./import-rule.component.css']
})

export class ImportRuleComponent implements OnInit {
  rule: Rule;
  sources: Source[];
  selectAll: boolean;
  validToSubmit: boolean;
  invalidMessage: string[];
  searchText: string;
  allOwnersFetched: boolean;
  loading: boolean;

  public modalRef: BsModalRef;
  
  @ViewChild('submitConfirmModal', { static: false }) submitConfirmModal: ModalDirective;

  @ViewChild('fileInput', {static: false}) fileInput: ElementRef;

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
    this.rule = null;
    this.sources = null;
    this.selectAll = false;
    this.searchText = null;
    this.loading = false;
    this.allOwnersFetched = false;
    this.invalidMessage = [];
    if (clearMsg) {
      this.messageService.clearAll();
    } 
  }

  search() {
    this.allOwnersFetched = false;
    this.loading = true;
    this.idnService.searchAggregationSources()
          .subscribe(allSources => {
            this.sources = [];
            let sourceCount = allSources.length;
            let fetchedOwnerCount = 0;
            for (let each of allSources) {
              let source = new Source();
              source.id = each.id;
              source.cloudExternalID = each.connectorAttributes.cloudExternalId;
              source.name = each.name;
              source.description = each.description;
              source.type = each.type;
              
              let query = new SimpleQueryCondition();
              query.attribute = "id";
              query.value = each.owner.id;

              this.idnService.searchAccounts(query)
                .subscribe(searchResult => { 
                  if (searchResult.length > 0) {
                    source.owner = new SourceOwner();
                    source.owner.accountId = searchResult[0].id;
                    source.owner.accountName = searchResult[0].name;
                    source.owner.displayName = searchResult[0].displayName;
                  }
                  fetchedOwnerCount++;
                  if (fetchedOwnerCount == sourceCount) {
                    this.allOwnersFetched = true;
                  }
              });
          
              this.sources.push(source);
            }
            this.loading = false;
          });
  }

  changeOnSelect($event, index: number) {
    this.messageService.clearError();
    if (!$event.currentTarget.checked) {
      this.selectAll = false;
      if (this.sources[index].newOwner) {
        this.sources[index].newOwner.accountName = null;
      }
    } else {
      if (this.sources[index].newOwner == null) {
        this.sources[index].newOwner = new SourceOwner();
      }
      this.sources[index].newOwner.accountName = this.sources[index].owner.accountName;
    }
  }

  showSubmitConfirmModal() {
    this.messageService.clearError();
    this.validToSubmit = true;
    this.invalidMessage = [];
    
    if (this.rule == null) {
      this.invalidMessage.push("No rule man!");
      this.validToSubmit = false;
    }

    if (this.validToSubmit) {
      this.submitConfirmModal.show();
    } else {
      this.submitConfirmModal.show();
    }
  }

  hideSubmitConfirmModal() {
    this.submitConfirmModal.hide();
  }

  closeModalDisplayMsg() {
    this.submitConfirmModal.hide();
  }

  importRule() {
    this.messageService.clearAll();
    this.idnService.createConnectorRule(this.rule)
      .subscribe(
        searchResult => {
          this.closeModalDisplayMsg();
          this.messageService.add("Rule imported successfully.");
          this.rule = null;
        },
        err => {
          this.closeModalDisplayMsg();
          this.rule = null;
          this.messageService.handleIDNError(err);
        }
      );
  }

  clearFileSelect() {
    this.rule = null;
    this.messageService.clearError();
    this.fileInput.nativeElement.value = "";
  }

  handleFileSelect(evt) {
    this.messageService.clearError();
    var files = evt.target.files; // FileList object
    var file = files[0];
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (event: any) => {
      var ruleXML = event.target.result; // Content of Rule XML file
      const parser = new xml2js.Parser({ strict: false, trim: true });
      parser.parseString(ruleXML, (err, result) => {
        let valid: boolean = true;
        if (result.RULE && result.RULE.$) {
          if (result.RULE.$.NAME) {
            this.rule = new Rule();
            this.rule.name = result.RULE.$.NAME;
            if (result.RULE.DESCRIPTION && result.RULE.DESCRIPTION.length == 1) {
              this.rule.description = result.RULE.DESCRIPTION[0];
            }
            if (result.RULE.SOURCE && result.RULE.SOURCE.length == 1) {
              this.rule.script = result.RULE.SOURCE[0];
            } else {
              valid = false;
              this.messageService.setError("Invalid Rule XML file: source is not specified.");
            }
          } else {
            valid = false;
            this.messageService.setError("Invalid Rule XML file: rule name is not specified.");
          }
          
          if (result.RULE.$.TYPE) {
              this.rule.type = result.RULE.$.TYPE;
          } else {
            valid = false;
            this.messageService.setError("Invalid Rule XML file: rule type is not specified.");
          }
        } else {
          valid = false;
          this.messageService.setError("Invalid Rule XML file.");
        }
        if (!valid) {
          this.rule = null;
        }
      });
    }
  }

  convertRuleToXML(rule: Rule) {
    let ruleDesc = null;
    if (rule.description) {
      ruleDesc = rule.description;
    }

    // const builder = new xml2js.Builder({xmldec: {standalone: false, encoding: 'UTF-8'}});
    const builder = new xml2js.Builder({cdata: true, doctype: {sysID: "sailpoint.dtd sailpoint.dtd"}});
    // const builder = new xml2js.Builder();
    let xmlObject = {Rule: {$: 
                              {name: rule.name,
                               type: rule.type  
                              },
                            'Description': {
                                _: ruleDesc
                              },
                            'Source': {
                                _: rule.script
                              }   
                           }
                    };

    let xml: string = builder.buildObject(xmlObject);
    xml = xml.replace("Rule SYSTEM \"sailpoint.dtd sailpoint.dtd\"", "Rule PUBLIC \"sailpoint.dtd\" \"sailpoint.dtd\"");
    xml = xml.replace(" standalone=\"yes\"?>", "?>");
    console.log("xml: " + xml);
    
    var blob = new Blob([xml], {type: "application/xml"});
    let fileName = rule.name + " - " + rule.type + ".xml";
    saveAs(blob, fileName);
  }

}
