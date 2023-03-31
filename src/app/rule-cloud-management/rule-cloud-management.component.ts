import { Component, OnInit } from '@angular/core';
import xml2js from 'xml2js';
import { saveAs } from 'file-saver';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Rule } from '../model/rule';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { AuthenticationService } from '../service/authentication-service.service';
import * as JSZip from 'jszip';

const RuleDescriptionMaxLength = 50;

@Component({
  selector: 'app-rule-cloud-management',
  templateUrl: './rule-cloud-management.component.html',
  styleUrls: ['./rule-cloud-management.component.css'],
})
export class CloudRuleComponent implements OnInit {
  rules: Rule[];
  invalidMessage: string[];
  searchText: string;
  loading: boolean;
  jobId: string;
  jobStatus: string;
  zip: JSZip = new JSZip();
  buttonClicked: string;

  public modalRef: BsModalRef;

  constructor(
    private idnService: IDNService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit() {
    this.reset(true);
    this.exportSPConfigRules();
  }

  reset(clearMsg: boolean) {
    this.searchText = null;
    this.jobId = null;
    this.jobStatus = null;
    this.loading = false;
    this.invalidMessage = [];
    if (clearMsg) {
      this.messageService.clearAll();
    }
  }

  exportSPConfigRules() {
    this.loading = true;
    this.idnService.exportCloudRules().subscribe(results => {
      if (results != null) {
        this.jobId = results.jobId;
        this.checkExportJobStatus(this.jobId);
        this.loading = true;
      }
    });
  }

  async checkExportJobStatus(jobId: string) {
    this.loading = true;
    this.idnService.checkSPConfigJobStatus(jobId).subscribe(async results => {
      if (results != null) {
        this.jobStatus = results.status;

        //should work but not tested
        if (this.jobStatus === 'CANCELLED' || this.jobStatus === 'FAILED') {
          this.messageService.addError(
            'Export JobStatus Error: `${this.jobStatus}`'
          );
          return null;
        } else if (this.jobStatus === 'COMPLETE') {
          this.getSPConfigExports(this.jobId);
        } else {
          await this.sleep(2000);
          this.checkExportJobStatus(this.jobId);
        }
        this.loading = true;
      }
    });
  }

  getSPConfigExports(jobId: string) {
    this.loading = true;
    this.idnService.downloadSPConfigExport(jobId).subscribe(results => {
      this.rules = [];
      for (const each of results.objects) {
        const rule = new Rule();
        rule.type = each.object.type;

        if (
          rule.type == 'IdentityAttribute' ||
          rule.type == 'AttributeGenerator' ||
          rule.type == 'AttributeGeneratorFromTemplate' ||
          rule.type == 'Correlation' ||
          rule.type == 'ManagerCorrelation' ||
          rule.type == 'BeforeProvisioning' ||
          rule.type == 'Generic' ||
          rule.type == '' ||
          rule.type == null
        ) {
          rule.id = each.object.id;
          rule.name = each.object.name;
          rule.created = each.object.created;
          rule.modified = each.object.modified;
          rule.object = each.object;

          if (each.object.description) {
            if (each.object.description.length > RuleDescriptionMaxLength) {
              rule.description =
                each.object.description.substring(0, RuleDescriptionMaxLength) +
                '...';
            } else {
              rule.description = each.object.description;
            }
          }

          this.rules.push(rule);
        }
      }
      this.loading = false;
    });
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  processRuleAttributes(result) {
    if (result.RULE.ATTRIBUTES && result.RULE.ATTRIBUTES.length > 0) {
      const attrMap = result.RULE.ATTRIBUTES[0].MAP;
      if (attrMap && attrMap.length > 0) {
        const entry = attrMap[0];
        if (entry && entry.ENTRY && entry.ENTRY.length > 0) {
          const ruleAttributes = {};
          for (const each of entry.ENTRY) {
            ruleAttributes[each.$.KEY] = each.$.VALUE;
          }
          return ruleAttributes;
        }
      }
    }

    return null;
  }

  convertRuleToXML(rule: Rule, buttonClicked: string) {
    let ruleDesc = null;

    if (rule.description) {
      ruleDesc = rule.description;
    } else {
      ruleDesc = '';
    }

    const builder = new xml2js.Builder({
      doctype: { sysID: 'sailpoint.dtd sailpoint.dtd' },
    });
    const xmlObject = {
      Rule: {
        $: {
          name: rule.name,
          type: rule.type,
        },
        Attributes: [this.prepareRuleAttributes(rule.attributes)],
        Description: {
          _: ruleDesc,
        },
        Source: {
          _: rule.script,
        },
      },
    };

    let xml: string = builder.buildObject(xmlObject);
    // xml.replace is a hack to format certain elements that xml2js does not support
    xml = xml.replace(
      'Rule SYSTEM "sailpoint.dtd sailpoint.dtd"',
      'Rule PUBLIC "sailpoint.dtd" "sailpoint.dtd"'
    );
    xml = xml.replace(' standalone="yes"?>', '?>');
    xml = xml.replace('<Source>', '<Source><![CDATA[\n');
    xml = xml.replace('</Source>', '\n]]></Source>');
    xml = xml.replace('&lt;#', '<#');
    xml = xml.replace('#&gt;', '#>');
    // replace carriage return characters, if exist
    let re = /&#xD;/gi;
    xml = xml.replace(re, '');

    re = /&amp;/gi;
    xml = xml.replace(re, '&');

    re = /&gt;/gi;
    xml = xml.replace(re, '>');

    re = /&lt;/gi;
    xml = xml.replace(re, '<');

    const blob = new Blob([xml], { type: 'application/xml' });

    if (rule.type === '' || rule.type == null) {
      rule.type = 'Generic';
    }

    if (buttonClicked === 'downloadRule') {
      const fileName = 'Rule - ' + rule.type + ' - ' + rule.name + '.xml';
      saveAs(blob, fileName);
    } else {
      return blob;
    }
  }

  prepareRuleAttributes(attributes) {
    let returnObject = null;
    if (attributes) {
      const attrs = [];
      for (const name of Object.keys(attributes)) {
        const attr = {
          $: {
            key: name,
            value: attributes[name],
          },
        };
        attrs.push(attr);
      }
      returnObject = {
        Map: [
          {
            entry: attrs,
          },
        ],
      };
    }

    return returnObject;
  }

  downloadRule(ruleId: string, $event) {
    if ($event && $event != '') {
      this.buttonClicked = $event.target.name;
    }

    for (const selectedRule of this.rules) {
      if (selectedRule.id === ruleId) {
        const donwloadedRule = this.processDownloadRule(selectedRule);
        if (donwloadedRule != null) {
          this.convertRuleToXML(donwloadedRule, this.buttonClicked);
        }
      }
    }
  }

  processDownloadRule(result): Rule {
    if (result) {
      const processedRule = new Rule();
      processedRule.id = result.object.id;
      processedRule.type = result.object.type;
      processedRule.name = result.object.name;
      processedRule.description = result.object.description;

      if (result.attributes) {
        processedRule.attributes = result.object.attributes;
      }

      if (result.object.sourceCode && result.object.sourceCode.script) {
        processedRule.script = result.object.sourceCode.script;
        return processedRule;
      } else {
        this.messageService.addError(
          'Invalid Rule: missing source code script.'
        );
        return null;
      }
    } else {
      this.messageService.addError('Failed to download rule');
      return null;
    }
  }

  exportAllRules($event) {
    if ($event && $event != '') {
      this.buttonClicked = $event.target.name;
    }

    for (const each of this.rules) {
      const downloadrule = this.processDownloadRule(each);

      const result = this.convertRuleToXML(downloadrule, this.buttonClicked);

      const fileName = 'Rule - ' + each.type + ' - ' + each.name + '.xml';
      this.zip.file(`${fileName}`, result);
    }
    const currentUser = this.authenticationService.currentUserValue;
    const zipFileName = `${currentUser.tenant}-cloud-rules.zip`;

    this.zip.generateAsync({ type: 'blob' }).then(function (content) {
      saveAs(content, zipFileName);
    });
  }
}
