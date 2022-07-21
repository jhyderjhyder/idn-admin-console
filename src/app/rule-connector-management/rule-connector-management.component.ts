import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import xml2js from 'xml2js';
import { saveAs } from 'file-saver';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Rule } from '../model/rule';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';

const RuleDescriptionMaxLength = 50;

@Component({
  selector: 'app-rule-connector-management',
  templateUrl: './rule-connector-management.component.html',
  styleUrls: ['./rule-connector-management.component.css']
})

export class ImportRuleComponent implements OnInit {
  ruleToImport: Rule;
  ruleToUpdate: Rule;
  ruleToDelete: Rule;
  deleteRuleNameText: string;
  rules: Rule[];
  validToSubmit: boolean;
  invalidMessage: string[];
  searchText: string;
  loading: boolean;

  public modalRef: BsModalRef;
  
  @ViewChild('importRuleConfirmModal', { static: false }) importRuleConfirmModal: ModalDirective;
  @ViewChild('updateRuleConfirmModal', { static: false }) updateRuleConfirmModal: ModalDirective;
  @ViewChild('deleteRuleConfirmModal', { static: false }) deleteRuleConfirmModal: ModalDirective;
  @ViewChild('importRuleFile', {static: false}) importRuleFile: ElementRef;
  @ViewChild('updateRuleFile', {static: false}) updateRuleFile: ElementRef;

  constructor(
    private idnService: IDNService, 
    private messageService: MessageService) {
  }

  ngOnInit() {
    this.reset(true);
    this.getConnectorRules();
  }

  reset(clearMsg: boolean) {
    this.ruleToImport = null;
    this.ruleToUpdate = null;
    this.ruleToDelete = null;
    this.deleteRuleNameText = null;
    this.searchText = null;
    this.loading = false;
    this.invalidMessage = [];
    if (clearMsg) {
      this.messageService.clearAll();
    } 
  }

  getConnectorRules() {
    this.loading = true;
    this.idnService.getConnectorRules()
          .subscribe(
            results => {
            this.rules = [];
            for (let each of results) {
              let rule = new Rule();
              rule.id = each.id;
              rule.name = each.name;
              if (each.description) {
                if (each.description.length > RuleDescriptionMaxLength) {
                  rule.description = each.description.substring(0, RuleDescriptionMaxLength) + "...";
                }
                else {
                  rule.description = each.description;
                }
              }
              rule.type = each.type;
              
              this.rules.push(rule);
            }
            this.loading = false;
          });
  }

  showImportRuleConfirmModal() {
    this.messageService.clearError();
    this.validToSubmit = true;
    this.invalidMessage = [];
    
    if (this.ruleToImport == null) {
      this.invalidMessage.push("No rule is chosen!");
      this.validToSubmit = false;
    }

    if (this.validToSubmit) {
      this.importRuleConfirmModal.show();
    } else {
      this.importRuleConfirmModal.hide();
    }
  }

  hideImportRuleConfirmModal() {
    this.importRuleConfirmModal.hide();
  }

  showUpdateRuleConfirmModal(selectedRule: Rule) {
    this.updateRuleFile.nativeElement.value = "";
    this.invalidMessage = [];
    this.ruleToUpdate = new Rule();
    this.ruleToUpdate.id = selectedRule.id;
    this.ruleToUpdate.name = selectedRule.name;
    this.ruleToUpdate.type = selectedRule.type;
    this.ruleToUpdate.description = selectedRule.description;
    this.validToSubmit = false;
    this.updateRuleConfirmModal.show();
  }

  hideUpdateRuleConfirmModal() {
    this.updateRuleConfirmModal.hide();
  }

  showDeleteRuleConfirmModal(selectedRule: Rule) {
    this.invalidMessage = [];
    this.deleteRuleNameText = null;
    this.ruleToDelete = new Rule();
    this.ruleToDelete.id = selectedRule.id;
    this.ruleToDelete.name = selectedRule.name;
    this.ruleToDelete.type = selectedRule.type;
    this.ruleToDelete.description = selectedRule.description;
    this.validToSubmit = false;
    this.deleteRuleConfirmModal.show();
  }

  hideDeleteRuleConfirmModal() {
    this.deleteRuleConfirmModal.hide();
  }

  deleteRule() {
    this.messageService.clearAll();
    this.invalidMessage = [];
    // validation
    if (this.deleteRuleNameText != this.ruleToDelete.name) {
      this.invalidMessage.push("Confirmed rule name does not match rule name!");
      this.validToSubmit = false;
      return;
    }
    else {
      this.validToSubmit = true;
    }

    this.idnService.deleteConnectorRule(this.ruleToDelete)
      .subscribe(
        result => {
          //this.closeModalDisplayMsg();
          this.deleteRuleConfirmModal.hide();
          this.messageService.add("Rule deleted successfully.");
          this.ruleToDelete = null;
          this.reset(false);
          this.getConnectorRules();
        },
        err => {
          this.deleteRuleConfirmModal.hide();
          this.ruleToDelete = null;
          this.messageService.handleIDNError(err);
        }
      );
  }

  importRule() {
    this.messageService.clearAll();
    this.idnService.importConnectorRule(this.ruleToImport)
      .subscribe(
        result => {
          this.importRuleConfirmModal.hide();
          this.messageService.add("Rule imported successfully.");
          this.ruleToImport = null;
          this.reset(false);
          this.getConnectorRules();
        },
        err => {
          this.importRuleConfirmModal.hide();
          this.ruleToImport = null;
          this.messageService.handleIDNError(err);
        }
      );
  }

  updatedRule() {
    this.messageService.clearAll();
    this.idnService.updateConnectorRule(this.ruleToUpdate)
      .subscribe(
        result => {
          this.updateRuleConfirmModal.hide();
          this.messageService.add("Rule updated successfully.");
          this.ruleToUpdate = null;
        },
        err => {
          this.updateRuleConfirmModal.hide();
          this.ruleToUpdate = null;
          this.messageService.handleIDNError(err);
        }
      );
  }

  clearFileForImportRule() {
    this.ruleToImport = null;
    this.messageService.clearError();
    this.importRuleFile.nativeElement.value = "";
  }

  clearFileForUpdateRule() {
    this.invalidMessage = [];
    this.updateRuleFile.nativeElement.value = "";
    this.validToSubmit = false;
  }

  processFileForImportRule(evt) {
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
          //verify rule name
          if (result.RULE.$.NAME) {
            this.ruleToImport = new Rule();
            this.ruleToImport.name = result.RULE.$.NAME;
          } else {
            valid = false;
            this.messageService.setError("Invalid Rule XML file: rule name is not specified.");
          }
          //verify rule type
          if (result.RULE.$.TYPE) {
              this.ruleToImport.type = result.RULE.$.TYPE;
          } else {
            valid = false;
            this.messageService.setError("Invalid Rule XML file: rule type is not specified.");
          }
        } else {
          valid = false;
          this.messageService.setError("Invalid Rule XML file.");
        }
        //verify source
        if (valid) {
          if (result.RULE.SOURCE && result.RULE.SOURCE.length == 1) {
            this.ruleToImport.script = result.RULE.SOURCE[0];
          } else {
            valid = false;
            this.messageService.setError("Invalid Rule XML file: source is not specified.");
          }
        }
        //now update description
        if (valid) {
          if (result.RULE.DESCRIPTION && result.RULE.DESCRIPTION.length == 1) {
            this.ruleToImport.description = result.RULE.DESCRIPTION[0];
          } 

          let ruleAttributes = this.processRuleAttributes(result);
          if (ruleAttributes) {
            this.ruleToImport.attributes = ruleAttributes;
          }

        } else {
          this.ruleToImport = null;
        }
      });
    }
  }

  processRuleAttributes(result) {
    if (result.RULE.ATTRIBUTES && result.RULE.ATTRIBUTES.length > 0) {
      let attrMap = result.RULE.ATTRIBUTES[0].MAP;
      if (attrMap && attrMap.length > 0) {
        let entry = attrMap[0];
        if (entry && entry.ENTRY && entry.ENTRY.length > 0) {
          let ruleAttributes = {};
          for (let each of entry.ENTRY) {
            ruleAttributes[each.$.KEY] = each.$.VALUE;
          }
          return ruleAttributes;
        }
      }
    }

    return null;
  }

  processFileForUpdatRule(evt) {
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
          //verify rule name
          if (result.RULE.$.NAME) {
            if (this.ruleToUpdate.name != result.RULE.$.NAME) {
              valid = false;
              this.invalidMessage.push("Invalid Rule XML file: rule name can not be changed.");
            }
          } else {
            valid = false;
            this.invalidMessage.push("Invalid Rule XML file: rule name is not specified.");
          }
          //verify rule type
          if (result.RULE.$.TYPE) {
            if (this.ruleToUpdate.type != result.RULE.$.TYPE) {
              valid = false;
              this.invalidMessage.push("Invalid Rule XML file: rule type can not be changed.");
            }
          } else {
            valid = false;
            this.invalidMessage.push("Invalid Rule XML file: rule type is not specified.");
          }
        } else {
          valid = false;
          this.invalidMessage.push("Invalid Rule XML file.");
        }
        //verify source
        if (valid) {
          if (result.RULE.SOURCE && result.RULE.SOURCE.length == 1) {
            this.ruleToUpdate.script = result.RULE.SOURCE[0];
          } else {
            valid = false;
            this.messageService.setError("Invalid Rule XML file: source is not specified.");
          }
        }
        //now update description
        if (valid) {
          if (result.RULE.DESCRIPTION && result.RULE.DESCRIPTION.length == 1) {
            this.ruleToUpdate.description = result.RULE.DESCRIPTION[0];
          }
          
          let ruleAttributes = this.processRuleAttributes(result);
          if (ruleAttributes) {
            this.ruleToUpdate.attributes = ruleAttributes;
          }
        }

        this.validToSubmit = valid;
      });
    }
  }

  convertRuleToXML(rule: Rule) {
    let ruleDesc = null;
    if (rule.description) {
      ruleDesc = rule.description;
    }
    else {
      ruleDesc = "";
    }

    const builder = new xml2js.Builder({doctype: {sysID: "sailpoint.dtd sailpoint.dtd"}});
    let xmlObject = {
                      Rule: {
                        $: {
                          name: rule.name,
                          type: rule.type  
                        },
                        "Attributes": [this.prepareRuleAttributes(rule.attributes)],
                        'Description': {
                          _: ruleDesc
                        },
                        'Source': {
                          _: rule.script
                        },
                      }
                    };

    let xml: string = builder.buildObject(xmlObject);
    // xml.replace is a hack to format certain elements that xml2js does not support
    xml = xml.replace("Rule SYSTEM \"sailpoint.dtd sailpoint.dtd\"", "Rule PUBLIC \"sailpoint.dtd\" \"sailpoint.dtd\"");
    xml = xml.replace(" standalone=\"yes\"?>", "?>");
    xml = xml.replace("<Source>", "<Source><![CDATA[\n");
    xml = xml.replace("</Source>", "\n]]></Source>");
    xml = xml.replace("&lt;#", "<#");
    xml = xml.replace("#&gt;", "#>");
    // replace carriage return characters, if exist
    var re = /&#xD;/gi;
    xml = xml.replace(re, "");

    re = /&amp;/gi;
    xml = xml.replace(re, "&");

    re = /&gt;/gi;
    xml = xml.replace(re, ">");

    re = /&lt;/gi;
    xml = xml.replace(re, "<");
    
    var blob = new Blob([xml], {type: "application/xml"});
    let fileName = "Rule - " + rule.type + " - " + rule.name + ".xml";
    saveAs(blob, fileName);
  }

  prepareRuleAttributes(attributes) {

    let returnObject = null;
    if (attributes) {
      let attrs = [];
      for (let name of Object.keys(attributes)) {
        let attr = {
                    "$": {
                      "key": name, 
                      "value": attributes[name]
                    }
                  };
                  attrs.push(attr);
      }
      returnObject = { 
                      "Map": [ 
                        { 
                          "entry": attrs
                        }
                      ]
                    };
    }

    return returnObject;
  }

  downloadRule(ruleId: string) {
    this.idnService.getConnectorRuleById(ruleId)
      .subscribe(
        result => {
          let donwloadedRule = this.processDownloadRule(result);
          if (donwloadedRule != null) {
            this.convertRuleToXML(donwloadedRule);
          }
        },
        err => this.messageService.handleIDNError(err)
      );
  }

  processDownloadRule(result): Rule {
    if (result) {
      let processedRule = new Rule();
      processedRule.id = result.id;
      processedRule.type = result.type;
      processedRule.name = result.name;
      processedRule.description = result.description;

      if (result.attributes) {
        processedRule.attributes = result.attributes;
      }

      if (result.sourceCode && result.sourceCode.script) {
        processedRule.script = result.sourceCode.script;
        return processedRule;
      } else {
        this.messageService.addError("Invalid Rule: missing source code script.");
        return null;
      }
    } else {
      this.messageService.addError("Failed to download rule");
      return null;
    }
  }

}
