import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { saveAs } from 'file-saver';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { Transform } from '../model/transform';
import {
  IdentityPreview,
  IdentityPreviewAttributeConfig,
  IdentityPreviewAttributeTransforms,
  IdentityPreviewAttributes,
  IdentityPreviewTransformDefinition,
} from '../model/identity-preview';
import JSZip from 'jszip';
import { AuthenticationService } from '../service/authentication-service.service';
import { prettyPrintJson } from 'pretty-print-json';
import { JsonFormatOptions } from '../model/json-format-options';
import { BasicAttributes } from '../model/basic-attributes';

@Component({
    selector: 'app-identity-transform-management',
    templateUrl: './identity-transform-management.component.html',
    styleUrls: ['./identity-transform-management.component.css'],
    standalone: false
})
export class IdentityTransformManagementComponent implements OnInit {
  transformToImport: Transform;
  transformToUpdate: Transform;
  transformToDelete: Transform;
  deleteTransformNameText: string;
  validToSubmit: boolean;
  invalidMessage: string[];
  searchText: string;
  loading: boolean;
  exporting: boolean;
  totalCount: number;
  allTransforms: any;
  rawObject: boolean;
  rawObjectEdit: string;
  rawObjectId: string;
  formSourceName: string;
  formApplicationAttribute: string;
  formPersonName: string;
  IdentityPreview: IdentityPreview;
  filterApplications: Array<BasicAttributes>;
  stringApplication: Array<String>;

  transforms: Transform[];
  zip: JSZip = new JSZip();

  public modalRef: BsModalRef;

  @ViewChild('importTransformConfirmModal', { static: false })
  importTransformConfirmModal: ModalDirective;
  @ViewChild('updateTransformConfirmModal', { static: false })
  updateTransformConfirmModal: ModalDirective;
  @ViewChild('deleteTransformConfirmModal', { static: false })
  deleteTransformConfirmModal: ModalDirective;
  @ViewChild('importTransformFile', { static: false })
  importTransformFile: ElementRef;
  @ViewChild('updateTransformFile', { static: false })
  updateTransformFile: ElementRef;
  @ViewChild('testTransformConfirmModal', { static: false })
  testTransformConfirmModal: ModalDirective;

  constructor(
    private idnService: IDNService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit() {
    this.reset(true);
    this.getAllTransforms();
    this.getApplicationNames();
  }

  reset(clearMsg: boolean) {
    this.rawObject = null;
    const elem = document.getElementById('jsonRaw');
    elem.innerHTML = '';
    this.transformToImport = null;
    this.transformToUpdate = null;
    this.transformToDelete = null;
    this.deleteTransformNameText = null;
    this.searchText = null;
    this.loading = false;
    this.exporting = false;
    this.totalCount = null;
    this.allTransforms = null;
    this.invalidMessage = [];
    if (clearMsg) {
      this.messageService.clearAll();
    }
    this.rawObjectEdit = null;
  }

  getAllTransforms() {
    this.loading = true;
    this.idnService.getAllTransforms().subscribe(results => {
      this.transforms = [];
      this.totalCount = results.length;
      this.allTransforms = results;
      for (const each of results) {
        const transform = new Transform();
        transform.id = each.id;
        transform.name = each.name;
        transform.type = each.type;
        transform.internal = each.internal;

        this.transforms.push(transform);
      }
      //https://stackabuse.com/sort-array-of-objects-by-string-property-value/
      const sortedTransforms = this.transforms.sort((a, b) =>
        a.name.toLowerCase() < b.name.toLowerCase()
          ? -1
          : b.name.toLowerCase() > a.name.toLowerCase()
          ? 1
          : 0
      );
      this.transforms = sortedTransforms;
      this.loading = false;
    });
  }

  showImportTransformConfirmModal() {
    this.messageService.clearError();
    this.validToSubmit = true;
    this.invalidMessage = [];

    if (this.transformToImport == null) {
      this.invalidMessage.push('No transform is chosen!');
      this.validToSubmit = false;
    }

    if (this.validToSubmit) {
      this.importTransformConfirmModal.show();
    } else {
      this.importTransformConfirmModal.hide();
    }
  }

  hideImportTransformConfirmModal() {
    this.importTransformConfirmModal.hide();
  }

  showUpdateTransformConfirmModal(selectedTransform: Transform) {
    this.updateTransformFile.nativeElement.value = '';
    this.invalidMessage = [];
    this.transformToUpdate = new Transform();
    this.transformToUpdate.id = selectedTransform.id;
    this.transformToUpdate.name = selectedTransform.name;
    this.transformToUpdate.type = selectedTransform.type;
    this.transformToUpdate.internal = selectedTransform.internal;
    this.validToSubmit = false;
    this.updateTransformConfirmModal.show();
  }

  hideUpdateTransformConfirmModal() {
    this.updateTransformConfirmModal.hide();
  }

  showDeleteTransformModal(selectedTransform: Transform) {
    this.invalidMessage = [];
    this.deleteTransformNameText = null;
    this.transformToDelete = new Transform();
    this.transformToDelete.id = selectedTransform.id;
    this.transformToDelete.name = selectedTransform.name;
    this.transformToDelete.type = selectedTransform.type;
    this.transformToDelete.internal = selectedTransform.internal;
    this.validToSubmit = false;
    this.deleteTransformConfirmModal.show();
  }

  showTestTransformModal(selectedTransform: Transform) {
    this.invalidMessage = [];
    this.deleteTransformNameText = null;
    this.transformToDelete = new Transform();
    this.transformToDelete.id = selectedTransform.id;
    this.transformToDelete.name = selectedTransform.name;
    this.transformToDelete.type = selectedTransform.type;
    this.transformToDelete.internal = selectedTransform.internal;
    this.validToSubmit = false;
    this.testTransformConfirmModal.show();
  }
  hideTestTransformConfirmModal() {
    this.testTransformConfirmModal.hide();
  }

  getApplicationNames() {
    this.filterApplications = new Array<BasicAttributes>();
    const b = new BasicAttributes();
    b.name = '';
    b.value = '';
    this.filterApplications.push(b);
    this.stringApplication = new Array<String>();

    this.idnService.getAllSources().subscribe(response => {
      const searchResult = response;
      for (let i = 0; i < searchResult.length; i++) {
        const app = searchResult[i];
        const basic = new BasicAttributes();
        basic.name = app['name'];
        basic.value = app['id'];
        this.filterApplications.push(basic);
        this.stringApplication.push(basic.name);
      }
    });
  }
  async runTransform() {
    let personId = '';
    const person = await this.idnService
      .getPersonID(this.formPersonName)
      .toPromise();
    if (person.length > 0) {
      personId = person[0].id;
    } else {
      this.invalidMessage.push('Cant find person');
    }

    const ip = new IdentityPreview();
    ip.identityId = personId;

    const attributes = new IdentityPreviewAttributes();
    let email = this.formApplicationAttribute;
    if (email == null) {
      email = 'PrimaryLanID';
    }
    //console.log("source:" + this.formSourceName);
    let appId = '';
    for (const each of this.filterApplications) {
      if (each.name == this.formSourceName) {
        appId = each.value;
      }
    }
    attributes.applicationId = appId;

    attributes.applicationName = this.formSourceName;
    attributes.attributeName = email;
    attributes.sourceName = this.formSourceName;
    attributes.id = this.transformToDelete.name;
    attributes.type = 'reference';
    const transformDefinition1 = new IdentityPreviewTransformDefinition();
    transformDefinition1.attributes = attributes;
    transformDefinition1.type = 'accountAttribute';

    const preview = new IdentityPreviewAttributeTransforms();
    preview.transformDefinition = transformDefinition1;
    const attConfig = new IdentityPreviewAttributeConfig();
    attConfig.attributeTransforms = new Array();
    attConfig.attributeTransforms.push(preview);

    ip.identityAttributeConfig = attConfig;
    const test = JSON.stringify(ip);
    console.log(test);

    this.idnService.getTransformResults(ip).subscribe(
      result => {
        // console.log(result.previewAttributes);

        for (const each of result.previewAttributes) {
          //const att = JSON.parse(each);
          const name = each.name;
          if (name == 'email') {
            alert(each.value);
          }
        }
      },
      err => {
        alert(JSON.stringify(err));
      }
    );
  }

  showJson(selectedTransform: Transform) {
    this.idnService.getTransformById(selectedTransform.id).subscribe(result => {
      const transform = new Transform();
      transform.name = result.name;
      transform.type = result.type;
      this.rawObject = result;
      //result = JSON.stringify(result, null, 4);
      const options: JsonFormatOptions = new JsonFormatOptions();
      options.lineNumbers = false;
      options.quoteKeys = true;
      options.trailingComma = false;

      //https://github.com/center-key/pretty-print-json
      const html = prettyPrintJson.toHtml(result, options);
      const elem = document.getElementById('jsonRaw');
      elem.innerHTML = html;
    });
  }

  editJson(selectedTransform: Transform) {
    this.idnService.getTransformById(selectedTransform.id).subscribe(result => {
      this.rawObjectEdit = JSON.stringify(result, null, 4);
      this.rawObjectId = result.id;
    });
  }

  save() {
    const rawData = (
      document.getElementById('userUpdatedObject') as HTMLInputElement
    ).value;
    try {
      const data = JSON.parse(rawData);

      this.idnService.updateTransform(data).subscribe(
        searchResult => {
          alert('Save Success');
          console.log(searchResult);
        },
        err => {
          this.messageService.handleIDNError(err);
          alert('Cant Save');
        }
      );
    } catch (err) {
      alert('Json Invalid:' + err);
    }
  }

  hideDeleteTransformConfirmModal() {
    this.deleteTransformConfirmModal.hide();
  }

  deleteTransform() {
    this.messageService.clearAll();
    this.invalidMessage = [];
    // validation
    if (this.deleteTransformNameText != this.transformToDelete.name) {
      this.invalidMessage.push(
        'Confirmed transform name does not match transform name!'
      );
      this.validToSubmit = false;
      return;
    } else {
      this.validToSubmit = true;
    }

    this.idnService.deleteTransform(this.transformToDelete.id).subscribe(
      () => {
        //this.closeModalDisplayMsg();
        this.deleteTransformConfirmModal.hide();
        this.messageService.add('Transform deleted successfully.');
        this.transformToDelete = null;
        this.reset(false);
        this.getAllTransforms();
      },
      err => {
        this.deleteTransformConfirmModal.hide();
        this.transformToDelete = null;
        this.messageService.handleIDNError(err);
      }
    );
  }

  importTransform() {
    this.messageService.clearAll();
    this.idnService.createTransform(this.transformToImport).subscribe(
      () => {
        this.importTransformConfirmModal.hide();
        this.messageService.add('Transform imported successfully.');
        this.transformToImport = null;
        this.reset(false);
        this.getAllTransforms();
      },
      err => {
        this.importTransformConfirmModal.hide();
        this.transformToImport = null;
        this.messageService.handleIDNError(err);
      }
    );
  }

  updateTransform() {
    this.messageService.clearAll();
    this.idnService.updateTransform(this.transformToUpdate).subscribe(
      () => {
        this.updateTransformConfirmModal.hide();
        this.messageService.add('Transform updated successfully.');
        this.transformToUpdate = null;
      },
      err => {
        this.updateTransformConfirmModal.hide();
        this.transformToUpdate = null;
        this.messageService.handleIDNError(err);
      }
    );
  }

  clearFileForImportTransform() {
    this.transformToImport = null;
    this.messageService.clearError();
    this.importTransformFile.nativeElement.value = '';
  }

  clearFileForUpdateTransform() {
    this.invalidMessage = [];
    this.updateTransformFile.nativeElement.value = '';
    this.validToSubmit = false;
  }

  isJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return e;
    }
    return 'valid';
  }

  processFileForImportTransform(evt) {
    this.messageService.clearError();
    const files = evt.target.files; // FileList object
    const file = files[0];
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (event: any) => {
      const transformJSON = event.target.result; // Content of Tranform JSON file
      let valid: boolean = true;
      if (this.isJsonString(transformJSON) != 'valid') {
        valid = false;
        this.messageService.setError(
          'Invalid Transform JSON file: Invalid JSON Format. Please check file'
        );
      } else {
        this.transformToImport = JSON.parse(transformJSON);
        //verify transform name exists
        if (!this.transformToImport.name) {
          valid = false;
          this.messageService.setError(
            'Invalid Transform JSON file: transform name is not specified.'
          );
        }
        //verify transform attribute body exists
        if (!this.transformToImport.attributes) {
          valid = false;
          this.messageService.setError(
            'Invalid Transform JSON file: transform attributes body is not specified.'
          );
        }
        //verify transform type
        if (!this.transformToImport.type) {
          valid = false;
          this.messageService.setError(
            'Invalid Transform JSON file: transform type is not specified.'
          );
        }
      }
      if (!valid) {
        this.transformToImport = null;
      }
    };
  }

  processFileForUpdatTransform(evt) {
    this.messageService.clearError();
    const files = evt.target.files; // FileList object
    const file = files[0];
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (event: any) => {
      const transformJSON = event.target.result; // Content of Tranform JSON file
      //const parsedTransformJSON = JSON.parse(transformJSON);
      let parsedTransformJSON = null;
      let valid: boolean = true;
      if (this.isJsonString(transformJSON) != 'valid') {
        valid = false;
        this.invalidMessage.push(
          'Invalid Transform JSON file: Invalid JSON Format. Please check file'
        );
      } else {
        parsedTransformJSON = JSON.parse(transformJSON);
        //verify transform name
        if (parsedTransformJSON.name) {
          if (this.transformToUpdate.name != parsedTransformJSON.name) {
            valid = false;
            this.invalidMessage.push(
              'Invalid Transform JSON file: transform name can not be changed.'
            );
          }
        } else {
          valid = false;
          this.invalidMessage.push(
            'Invalid Transform JSON file: transform name is not specified.'
          );
        }
        //verify transform type
        if (parsedTransformJSON.type) {
          if (this.transformToUpdate.type != parsedTransformJSON.type) {
            valid = false;
            this.invalidMessage.push(
              'Invalid Transform JSON file: transform type can not be changed.'
            );
          }
        } else {
          valid = false;
          this.invalidMessage.push(
            'Invalid Transform JSON file: transform type is not specified.'
          );
        }
        //verify transform attribute body exists
        if (!parsedTransformJSON.attributes) {
          valid = false;
          this.invalidMessage.push(
            'Invalid Transform JSON file: transform attributes body is not specified.'
          );
        } else {
          this.transformToUpdate.attributes = parsedTransformJSON.attributes;
        }
        //verify transform id
        if (parsedTransformJSON.id) {
          if (this.transformToUpdate.id != parsedTransformJSON.id) {
            valid = false;
            this.invalidMessage.push(
              'Invalid Transform JSON file: transform id can not be changed.'
            );
          }
        }
        //verify transform internal type
        if (parsedTransformJSON.internal) {
          if (this.transformToUpdate.internal != parsedTransformJSON.internal) {
            valid = false;
            this.invalidMessage.push(
              'Invalid Transform JSON file: transform internal type can not be changed.'
            );
          }
        }
      }
      this.validToSubmit = valid;
    };
  }

  downloadTransform(transformId: string) {
    this.idnService.getTransformById(transformId).subscribe(
      result => {
        const transform = new Transform();
        transform.name = result.name;
        transform.type = result.type;
        result = JSON.stringify(result, null, 4);

        const blob = new Blob([result], { type: 'application/json' });
        const fileName =
          'Transform - ' + transform.type + ' - ' + transform.name + '.json';
        saveAs(blob, fileName);
      },
      err => this.messageService.handleIDNError(err)
    );
  }

  exportAllTransforms() {
    this.exporting = true;

    // Get the already fetched this.allTransforms to export since its in a single page
    for (const each of this.allTransforms) {
      const transform = new Transform();
      const jsonData = JSON.stringify(each, null, 4);
      transform.name = each.name;
      transform.type = each.type;
      const fileName =
        'Transform - ' + transform.type + ' - ' + transform.name + '.json';
      this.zip.file(`${fileName}`, jsonData);
    }
    const currentUser = this.authenticationService.currentUserValue;
    const zipFileName = `${currentUser.tenant}-transforms.zip`;

    this.zip.generateAsync({ type: 'blob' }).then(function (content) {
      saveAs(content, zipFileName);
    });

    this.exporting = false;
  }
}
