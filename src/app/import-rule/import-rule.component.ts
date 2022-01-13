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
  selector: 'app-import-rule',
  templateUrl: './import-rule.component.html',
  styleUrls: ['./import-rule.component.css']
})

export class ImportRuleComponent implements OnInit {
  //rule to create
  rule: Rule;
  //rule to update
  ruleToUpdate: Rule;
  //rule to delete
  ruleToDelete: Rule;
  // validToDelete: boolean;
  rules: Rule[];
  validToSubmit: boolean;
  invalidMessage: string[];
  searchText: string;
  loading: boolean;

  public modalRef: BsModalRef;
  
  @ViewChild('createRuleConfirmModal', { static: false }) createRuleConfirmModal: ModalDirective;
  @ViewChild('updateRuleModal', { static: false }) updateRuleModal: ModalDirective;
  @ViewChild('deleteRuleConfirmModal', { static: false }) deleteRuleConfirmModal: ModalDirective;
  @ViewChild('fileInput', {static: false}) fileInput: ElementRef;
  @ViewChild('fileInputRuleUpdate', {static: false}) fileInputRuleUpdate: ElementRef;

  constructor(
    private idnService: IDNService, 
    private messageService: MessageService) {
  }

  ngOnInit() {
    this.reset(true);
    this.getConnectorRules();
  }

  reset(clearMsg: boolean) {
    this.rule = null;
    this.ruleToUpdate = null;
    this.ruleToDelete = null;
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
          .subscribe(results => {
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

  showCreateRuleConfirmModal() {
    this.messageService.clearError();
    this.validToSubmit = true;
    this.invalidMessage = [];
    
    if (this.rule == null) {
      this.invalidMessage.push("No rule man!");
      this.validToSubmit = false;
    }

    if (this.validToSubmit) {
      this.createRuleConfirmModal.show();
    } else {
      this.createRuleConfirmModal.show();
    }
  }

  hideCreateRuleConfirmModal() {
    this.createRuleConfirmModal.hide();
  }

  showUpdateRuleModal(selectedRule: Rule) {
    this.fileInputRuleUpdate.nativeElement.value = "";
    this.invalidMessage = [];
    this.ruleToUpdate = new Rule();
    this.ruleToUpdate.id = selectedRule.id;
    this.ruleToUpdate.name = selectedRule.name;
    this.ruleToUpdate.type = selectedRule.type;
    this.ruleToUpdate.description = selectedRule.description;
    this.validToSubmit = false;
    this.updateRuleModal.show();
  }

  hideUpdateRuleModal() {
    this.updateRuleModal.hide();
  }

  showDeleteRuleConfirmModal(selectedRule: Rule) {
    this.ruleToDelete = new Rule();
    this.ruleToDelete.id = selectedRule.id;
    this.ruleToDelete.name = selectedRule.name;
    this.ruleToDelete.type = selectedRule.type;
    this.ruleToDelete.description = selectedRule.description;
    // this.validToDelete = true;
    this.deleteRuleConfirmModal.show();
  }

  hideDeleteRuleConfirmModal() {
    this.deleteRuleConfirmModal.hide();
  }

  deleteRule() {
    this.messageService.clearAll();
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
    this.idnService.createConnectorRule(this.rule)
      .subscribe(
        searchResult => {
          this.createRuleConfirmModal.hide();
          this.messageService.add("Rule imported successfully.");
          this.rule = null;
          this.reset(false);
          this.getConnectorRules();
        },
        err => {
          this.createRuleConfirmModal.hide();
          this.rule = null;
          this.messageService.handleIDNError(err);
        }
      );
  }

  updatedRule() {
    this.messageService.clearAll();
    this.idnService.updateConnectorRule(this.ruleToUpdate)
      .subscribe(
        searchResult => {
          this.updateRuleModal.hide();
          this.messageService.add("Rule imported successfully.");
          this.rule = null;
        },
        err => {
          this.updateRuleModal.hide();
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

  clearFileSelect4RuleUpdate() {
    this.messageService.clearError();
    this.fileInputRuleUpdate.nativeElement.value = "";
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
          //verify rule name
          if (result.RULE.$.NAME) {
            this.rule = new Rule();
            this.rule.name = result.RULE.$.NAME;
          } else {
            valid = false;
            this.messageService.setError("Invalid Rule XML file: rule name is not specified.");
          }
          //verify rule type
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
        //verify source
        if (valid) {
          if (result.RULE.SOURCE && result.RULE.SOURCE.length == 1) {
            this.rule.script = result.RULE.SOURCE[0];
          } else {
            valid = false;
            this.messageService.setError("Invalid Rule XML file: source is not specified.");
          }
        }
        //now update description
        if (valid) {
          if (result.RULE.DESCRIPTION && result.RULE.DESCRIPTION.length == 1) {
            this.rule.description = result.RULE.DESCRIPTION[0];
          } 

          let ruleAttributes = this.processRuleAttributes(result);
          if (ruleAttributes) {
            this.rule.attributes = ruleAttributes;
          }

        } else {
          this.rule = null;
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

  selectFileToUpdatRule(evt) {
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
        }
        this.validToSubmit = valid;
      });
    }
  }

  convertResponseToRule(result): Rule {
    if (result) {
      let convertedRule = new Rule();
      convertedRule.id = result.id;
      convertedRule.type = result.type;
      convertedRule.name = result.name;
      convertedRule.description = result.description;
      if (result.sourceCode && result.sourceCode.script) {
        convertedRule.script = result.sourceCode.script;
        return convertedRule;
      } else {
        this.messageService.addError("Invalid Rule as it doesn't have the source code.");
        return null;
      }
    } else {
      this.messageService.addError("Failed to download the Rule");
      return null;
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
    let fileName = "Rule - " + rule.type + " - " + rule.name + ".xml";
    saveAs(blob, fileName);
  }

  downloadRule(ruleId: string) {
    this.idnService.retrieveConnectorRule(ruleId)
      .subscribe(
        result => {
          let donwloadedRule = this.convertResponseToRule(result);
          if (donwloadedRule != null) {
            this.convertRuleToXML(donwloadedRule);
          }
        },
        err => this.messageService.handleIDNError(err)
      );
  }

}
