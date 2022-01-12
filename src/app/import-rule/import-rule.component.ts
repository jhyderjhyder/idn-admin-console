import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import xml2js from 'xml2js';
import { saveAs } from 'file-saver';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Rule } from '../model/rule';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { AuthenticationService } from '../service/authentication-service.service';

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
  rules: Rule[];
  validToSubmit: boolean;
  invalidMessage: string[];
  searchText: string;
  loading: boolean;

  public modalRef: BsModalRef;
  
  @ViewChild('submitConfirmModal', { static: false }) submitConfirmModal: ModalDirective;
  @ViewChild('updateRuleModal', { static: false }) updateRuleModal: ModalDirective;
  
  @ViewChild('fileInput', {static: false}) fileInput: ElementRef;
  @ViewChild('fileInputRuleUpdate', {static: false}) fileInputRuleUpdate: ElementRef;

  constructor(
    private idnService: IDNService, 
    private messageService: MessageService,
    private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    this.reset(true);
    this.getConnectorRules();
  }

  reset(clearMsg: boolean) {
    this.rule = null;
    this.ruleToUpdate = null;
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

  showUpdateRuleModal(ruleId: string) {
    this.fileInputRuleUpdate.nativeElement.value = "";
    this.invalidMessage = [];
    this.idnService.retrieveConnectorRule(ruleId)
      .subscribe(
        result => {
          this.ruleToUpdate = this.convertResponseToRule(result);
          this.validToSubmit = false;
          this.updateRuleModal.show();
        },
        err => this.messageService.handleIDNError(err)
      );
  }

  hideUpdateRuleModal() {
    this.updateRuleModal.hide();
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
          this.reset(false);
          this.getConnectorRules();
        },
        err => {
          this.closeModalDisplayMsg();
          this.rule = null;
          this.messageService.handleIDNError(err);
        }
      );
  }

  updatedRule() {
    this.messageService.clearAll();
    this.idnService.createConnectorRule(this.ruleToUpdate)
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
        } else {
          this.rule = null;
        }
      });
    }
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
    let fileName = rule.name + " - " + rule.type + ".xml";
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
