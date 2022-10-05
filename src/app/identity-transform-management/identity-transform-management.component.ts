import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { saveAs } from 'file-saver';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { Transform } from '../model/transform';
import * as JSZip from 'jszip';
import { AuthenticationService } from '../service/authentication-service.service';

@Component({
  selector: 'app-identity-transform-management',
  templateUrl: './identity-transform-management.component.html',
  styleUrls: ['./identity-transform-management.component.css']
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

  transforms: Transform[];
  zip: JSZip = new JSZip();

  public modalRef: BsModalRef;
  
  @ViewChild('importTransformConfirmModal', { static: false }) importTransformConfirmModal: ModalDirective;
  @ViewChild('updateTransformConfirmModal', { static: false }) updateTransformConfirmModal: ModalDirective;
  @ViewChild('deleteTransformConfirmModal', { static: false }) deleteTransformConfirmModal: ModalDirective;
  @ViewChild('importTransformFile', {static: false}) importTransformFile: ElementRef;
  @ViewChild('updateTransformFile', {static: false}) updateTransformFile: ElementRef;

  constructor(
    private idnService: IDNService, 
    private messageService: MessageService,
    private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    this.reset(true);
    this.getAllTransforms();
  }

  reset(clearMsg: boolean) {
    this.transformToImport = null;
    this.transformToUpdate = null;
    this.transformToDelete = null;
    this.deleteTransformNameText = null;
    this.searchText = null;
    this.loading = false;
    this.invalidMessage = [];
    if (clearMsg) {
      this.messageService.clearAll();
    } 
  }

  getAllTransforms() {
    this.loading = true;
    this.idnService.getAllTransforms()
          .subscribe(
            results => {
            this.transforms = [];
            for (let each of results) {
              let transform = new Transform();
              transform.id = each.id;
              transform.name = each.name;
              transform.type = each.type;
              transform.internal = each.internal;
              
              this.transforms.push(transform);
            }
            this.loading = false;
          });
  }

  showImportTransformConfirmModal() {
    this.messageService.clearError();
    this.validToSubmit = true;
    this.invalidMessage = [];
    
    if (this.transformToImport == null) {
      this.invalidMessage.push("No transform is chosen!");
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
    this.updateTransformFile.nativeElement.value = "";
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

  hideDeleteTransformConfirmModal() {
    this.deleteTransformConfirmModal.hide();
  }

  deleteTransform() {
    this.messageService.clearAll();
    this.invalidMessage = [];
    // validation
    if (this.deleteTransformNameText != this.transformToDelete.name) {
      this.invalidMessage.push("Confirmed transform name does not match transform name!");
      this.validToSubmit = false;
      return;
    }
    else {
      this.validToSubmit = true;
    }

    this.idnService.deleteTransform(this.transformToDelete.id)
      .subscribe(
        result => {
          //this.closeModalDisplayMsg();
          this.deleteTransformConfirmModal.hide();
          this.messageService.add("Transform deleted successfully.");
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
    this.idnService.createTransform(this.transformToImport)
      .subscribe(
        result => {
          this.importTransformConfirmModal.hide();
          this.messageService.add("Transform imported successfully.");
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
    this.idnService.updateTransform(this.transformToUpdate)
      .subscribe(
        result => {
          this.updateTransformConfirmModal.hide();
          this.messageService.add("Transform updated successfully.");
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
    this.importTransformFile.nativeElement.value = "";
  }

  clearFileForUpdateTransform() {
    this.invalidMessage = [];
    this.updateTransformFile.nativeElement.value = "";
    this.validToSubmit = false;
  }

  isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return e;
    }
    return "valid";
}

  processFileForImportTransform(evt) {
    this.messageService.clearError();
    var files = evt.target.files; // FileList object
    var file = files[0];
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (event: any) => {
      var transformJSON = event.target.result; // Content of Tranform JSON file
      let valid: boolean = true;
      if (this.isJsonString(transformJSON) != "valid") {
        valid = false;
        this.messageService.setError("Invalid Transform JSON file: Invalid JSON Format. Please check file");
      } else {
          this.transformToImport = JSON.parse(transformJSON);
          //verify transform name exists
          if (!this.transformToImport.name) {
            valid = false;
            this.messageService.setError("Invalid Transform JSON file: transform name is not specified.");
          }
          //verify transform attribute body exists
          if (!this.transformToImport.attributes) {
            valid = false;
            this.messageService.setError("Invalid Transform JSON file: transform attributes body is not specified.");
          }
          //verify transform type
          if (!this.transformToImport.type) {
            valid = false;
            this.messageService.setError("Invalid Transform JSON file: transform type is not specified.");
          }
      }
      if (!valid) {
        this.transformToImport = null;
      }
    }
  }

  processFileForUpdatTransform(evt) {
    this.messageService.clearError();
    var files = evt.target.files; // FileList object
    var file = files[0];
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (event: any) => {
      var transformJSON = event.target.result; // Content of Tranform JSON file
      //let parsedTransformJSON = JSON.parse(transformJSON);
      let parsedTransformJSON = null;
      let valid: boolean = true;
      if (this.isJsonString(transformJSON) != "valid") {
        valid = false;
        this.invalidMessage.push("Invalid Transform JSON file: Invalid JSON Format. Please check file");
      } else {
          parsedTransformJSON = JSON.parse(transformJSON);
          //verify transform name
          if (parsedTransformJSON.name) {
            if (this.transformToUpdate.name != parsedTransformJSON.name) {
              valid = false;
              this.invalidMessage.push("Invalid Transform JSON file: transform name can not be changed.");
            }
          } else {
            valid = false;
            this.invalidMessage.push("Invalid Transform JSON file: transform name is not specified.");
          }
          //verify transform type
          if (parsedTransformJSON.type) {
            if (this.transformToUpdate.type != parsedTransformJSON.type) {
              valid = false;
              this.invalidMessage.push("Invalid Transform JSON file: transform type can not be changed.");
            }
          } else {
            valid = false;
            this.invalidMessage.push("Invalid Transform JSON file: transform type is not specified.");
          }
          //verify transform attribute body exists
          if (!parsedTransformJSON.attributes) {
            valid = false;
            this.invalidMessage.push("Invalid Transform JSON file: transform attributes body is not specified.");
          }
          //verify transform id
          if (parsedTransformJSON.id) {
            if (this.transformToUpdate.id != parsedTransformJSON.id) {
              valid = false;
              this.invalidMessage.push("Invalid Transform JSON file: transform id can not be changed.");
            }
          } 
          //verify transform internal type
          if (parsedTransformJSON.internal) {
            if (this.transformToUpdate.internal != parsedTransformJSON.internal) {
              valid = false;
              this.invalidMessage.push("Invalid Transform JSON file: transform internal type can not be changed.");
            }
          } 
        }
        this.validToSubmit = valid;
    }
  }

  downloadTransform(transformId: string) {
    this.idnService.getTransformById(transformId)
      .subscribe(
        result => {
          let transform = new Transform();
          transform.name = result.name;
          transform.type = result.type;
          result = JSON.stringify(result, null, 4);
          

          var blob = new Blob([result], {type: "application/json"});
          let fileName = "Transform - " + transform.type + " - " + transform.name + ".json";
          saveAs(blob, fileName);

        },
        err => this.messageService.handleIDNError(err)
      );
  }

  exportAllTransforms() {
    
    this.idnService.getAllTransforms()
          .subscribe(
            results => {
            this.transforms = [];
            for (let each of results) {
              let transform = new Transform();
              let jsonData = JSON.stringify(each, null, 4);
              transform.name = each.name;
              transform.type = each.type;
              let fileName = "Transform - " + transform.type + " - " + transform.name + ".json";
              this.zip.file(`${fileName}`, jsonData);
              
            }
            const currentUser = this.authenticationService.currentUserValue;
            let zipFileName = `${currentUser.tenant}-transforms.zip`;

           this.zip.generateAsync({type:"blob"}).then(function(content) {
              saveAs(content, zipFileName);
          });

          this.ngOnInit();

          });    
  }


}
