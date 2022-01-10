import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';
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

const ValidRuleTypes = ["BuildMap", "ConnectorAfterCreate", "ConnectorAfterDelete", "ConnectorAfterModify", "ConnectorBeforeCreate", 
                        "ConnectorBeforeDelete", "ConnectorBeforeModify", "JDBCBuildMap", "JDBCOperationProvisioning", "JDBCProvision",
                        "PeopleSoftHRMSBuildMap", "PeopleSoftHRMSOperationProvisioning", "PeopleSoftHRMSProvision", "RACFPermissionCustomization", "SAPBuildMap", 
                        "SapHrManagerRule", "SapHrOperationProvisioning", "SapHrProvision", "SuccessFactorsOperationProvisioning", "WebServiceAfterOperationRule",
                        "WebServiceBeforeOperationRule"];

@Component({
  selector: 'app-import-rule',
  templateUrl: './import-rule.component.html',
  styleUrls: ['./import-rule.component.css']
})

export class ImportRuleComponent implements OnInit {
  rule: Rule;
  sources: Source[];
  selectAll: boolean;
  newOwnerAll: string;
  validToSubmit: boolean;
  invalidMessage: string[];
  errorMessage: string;
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
    this.sources = null;
    this.selectAll = false;
    this.newOwnerAll = null;
    this.searchText = null;
    this.loading = false;
    this.allOwnersFetched = false;
    this.invalidMessage = [];
    if (clearMsg) {
      this.messageService.clearAll();
      this.errorMessage = null;
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

  changeOnSelectAll() {
    this.messageService.clearError();
    this.searchText = null;
    this.sources.forEach(each => {
      each.selected = !this.selectAll;
      if (each.selected) {
        if (each.newOwner == null) {
          each.newOwner = new SourceOwner();
        }
        each.newOwner.accountName = each.owner.accountName;
      } else {
        if (each.newOwner) {
          each.newOwner.accountName = null;
        }
      }
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

  applyNewOwnerToAllSelected() {
    this.messageService.clearError();
    if (this.newOwnerAll && this.newOwnerAll.trim() != '') {
      let anythingSelected = false;
      for (let each of this.sources) {
        if (each.selected) {
          if (each.newOwner == null) {
            each.newOwner = new SourceOwner();
          }
          each.newOwner.accountName = this.newOwnerAll;
          anythingSelected = true;
        }
      }
      if (!anythingSelected) {
        this.messageService.setError("No item is selected to apply the new owner account name.");
      }
    } else {
      this.messageService.setError("Owner account name is required to apply to the selected items.");
    }
  }

  showSubmitConfirmModal() {
    this.messageService.clearError();
    this.validToSubmit = true;
    let selectedSources = [];
    this.invalidMessage = [];
    /*
    for (let each of this.sources) {
      if (each.selected) {
        if (each.newOwner == null || each.newOwner.accountName == null || each.newOwner.accountName.trim() == '') {
          this.invalidMessage.push(`Owner of Source (name: ${each.name}) can not be empty.`);
          this.validToSubmit = false;
        }
        else if (each.newOwner.accountName == each.owner.accountName) {
          this.invalidMessage.push(`Owner of Source (name: ${each.name}) is not changed.`);
          this.validToSubmit = false;
        }

        selectedSources.push(each);
      }
    }

    if (selectedSources.length == 0) {
      this.invalidMessage.push("Select at least one item to submit.");
      this.validToSubmit = false;
    }
    */

    if (this.rule == null) {
      this.invalidMessage.push("No rule man!");
      this.validToSubmit = false;
    }

    if (this.validToSubmit) {
      this.submitConfirmModal.show();
      /*
      let count = 0;
      //check if account name of new owner is valid
      for (let each of selectedSources) {
        let query = new SimpleQueryCondition();
        query.attribute = "name";
        query.value = each.newOwner.accountName;

        this.idnService.searchAccounts(query)
          .subscribe(searchResult => { 
            if (searchResult && searchResult.length == 1) {
              each.newOwner.accountId = searchResult[0].id;
              each.newOwner.displayName = searchResult[0].displayName;
            } else {
              this.validToSubmit = false;
              this.invalidMessage.push(`New owner's account name (${each.newOwner.accountName}) of Source (${each.name}) is invalid.`);
            }
            count++;
            if (count == selectedSources.length) {
              this.submitConfirmModal.show();
            }
        });
      }
      */
    } else {
      this.submitConfirmModal.show();
    }
  }

  hideSubmitConfirmModal() {
    this.submitConfirmModal.hide();
  }

  closeModalDisplayMsg() {
    if (this.errorMessage != null) {
      this.messageService.setError(this.errorMessage);
    } else {
      this.messageService.add("Rule imported successfully.");
    }
    this.submitConfirmModal.hide();
  }

  updateSourceOwner() {
    let arr = this.sources.filter(each => each.selected);
    let processedCount = 0;
    for (let each of arr) {
      this.idnService.updateSourceOwner(each)
          .subscribe(searchResult => {
            processedCount++;
            if (processedCount == arr.length) {
             this.closeModalDisplayMsg();
             this.reset(false);
             this.search();
            }
          },
          err => {
            this.errorMessage = "Error to submit the changes.";
            processedCount++;
            if (processedCount == arr.length) {
              this.closeModalDisplayMsg();
              this.reset(false);
              this.search();
            }
          }
        );
    }

  }

  importRule() {
    this.idnService.createConnectorRule(this.rule)
      .subscribe(
        searchResult => {this.closeModalDisplayMsg()},
        err => {
          this.closeModalDisplayMsg();
          this.messageService.clearAll();
          this.messageService.setError("There is an error but we will figure out what later...");
        }
      );
  }

  saveInCsv() {
    var options = { 
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useHeader: true,
      headers: ["name", "description", "type", "cloudExternalID", "ownerAccountID", "ownerDisplayName"],
      nullToEmptyString: true,
    };

    const currentUser = this.authenticationService.currentUserValue;
    let fileName = `${currentUser.tenant}-Source-Owners`;
    let arr = [];
    for (let each of this.sources) {
      let record = Object.assign(each);
      if (each.owner) {
        record.ownerAccountID = each.owner.accountName;
        record.ownerDisplayName = each.owner.displayName;
      }
      arr.push(record);
    }

    let angularCsv: AngularCsv = new AngularCsv(arr, fileName, options);
  }

  clearFileSelect() {
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
              this.rule = null;
              this.messageService.setError("Invalid Rule XML file: source is not specified.");
            }
          } else {
            this.messageService.setError("Invalid Rule XML file: rule name is not specified.");
          }
          if (result.RULE.$.TYPE) {
            if (ValidRuleTypes.includes(result.RULE.$.TYPE)) {
              this.rule.type = result.RULE.$.TYPE;
            } else {
              this.messageService.setError("Invalid Rule XML file: rule type '" + result.RULE.$.TYPE + "' is invalid.");
            }
          } else {
            this.messageService.setError("Invalid Rule XML file: rule type is not specified.");
          }
        } else {
          this.messageService.setError("Invalid Rule XML file.");
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
    // const builder = new xml2js.Builder({cdata: true});
    const builder = new xml2js.Builder();
    let xmlObject = {Rule: {$: 
                              {name: rule.name,
                               type: rule.type  
                              },
                            _: 
                              {Description: ruleDesc,
                               Source: rule.script
                              }
                            }
                    };

    let xml = builder.buildObject(xmlObject);
    console.log("xml: " + xml);
    
    var blob = new Blob([xml], {type: "application/xml"});
    let fileName = rule.name + " - " + rule.type + ".xml";
    saveAs(blob, fileName);

  }

}
