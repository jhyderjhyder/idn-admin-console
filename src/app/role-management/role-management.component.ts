import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Source } from '../model/source';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { AuthenticationService } from '../service/authentication-service.service';
import { Role } from '../model/role';
import { SimpleQueryCondition } from '../model/simple-query-condition';
import { SourceOwner } from '../model/source-owner';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';

const RoleDescriptionMaxLength = 50;

@Component({
  selector: 'app-role-management',
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.css']
})
export class RoleManagementComponent implements OnInit {
  sources: Source[];
  bulkAction: string;
  selectAll: boolean;
  atLeastOneSelected: boolean;
  errorInvokeApi: boolean;
  searchText: string;
  loading: boolean;
  invalidMessage: string[];

  allOwnersFetched: boolean;
  roles: Role[];
  rolesToShow: Role[];
  validToSubmit: boolean;
  errorMessage: string;
  deleteRoleConfirmText: string;

  zip: JSZip = new JSZip();

  public modalRef: BsModalRef;

  @ViewChild('submitConfirmModal', { static: false }) submitConfirmModal: ModalDirective;
  @ViewChild('submitRoleRefreshConfirmModal', { static: false }) submitRoleRefreshConfirmModal: ModalDirective;
  @ViewChild('deleteRoleConfirmModal', { static: false }) deleteRoleConfirmModal: ModalDirective;

  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  constructor(private idnService: IDNService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    this.reset(true);
    this.getAllRoles();
  }

  reset(clearMsg: boolean) {
    this.sources = null;
    this.bulkAction = null;
    this.selectAll = null;
    this.atLeastOneSelected = null;
    this.searchText = null;
    this.loading = false;
    this.invalidMessage = [];

    this.allOwnersFetched = false;
    this.roles = null;
    this.rolesToShow = null;
    this.errorMessage = null;
    this.deleteRoleConfirmText = null;
    if (clearMsg) {
      this.messageService.clearAll();
      this.errorInvokeApi = false;
    }
  }

  getAllRoles() {
    this.allOwnersFetched = false;
    this.loading = true;
    this.idnService.getAllRoles()
      .subscribe(allRoles => {
        this.roles = [];
        this.rolesToShow = [];
        const roleCount = allRoles.length;
        let fetchedOwnerCount = 0;
        for (const each of allRoles) {
          const role = new Role();
          role.id = each.id;
          role.name = each.name;
          if (each.description) {
            if (each.description.length > RoleDescriptionMaxLength) {
              role.shortDescription = each.description.substring(0, RoleDescriptionMaxLength) + "...";
            }
            else {
              role.description = each.description;
              role.shortDescription = each.description;
            }
          }
          role.id = each.id;
          role.enabled = each.enabled;
          role.requestable = each.requestable;

          const identityNames = [];

          if (each.membership && each.membership.criteria != null) {
            role.criteriaDetail = JSON.stringify(each.membership.criteria);
            role.criteria = true;
          } else {
            role.criteria = false;
            if (each.membership && each.membership.identities != null) {
              for (const identities of each.membership.identities) {
                identityNames.push(identities.name);
              }
              role.identityList = identityNames.join(";").toString();
            }
          }

          role.accessProfiles = each.accessProfiles.length;

          const accessProfileNames = [];

          if (each.accessProfiles) {
            for (const accessprofile of each.accessProfiles) {
              accessProfileNames.push(accessprofile.name);
            }
          }

          role.accessProfilesNames = accessProfileNames.join(";").toString();

          this.idnService.getRoleIdentityCount(each)
            .subscribe(identityCount => {
              role.identityCount = identityCount.headers.get('X-Total-Count');
            });


          const query = new SimpleQueryCondition();
          query.attribute = "id";
          query.value = each.owner.id;

          this.idnService.searchAccounts(query)
            .subscribe(searchResult => {
              if (searchResult.length > 0) {
                role.owner = new SourceOwner();
                role.owner.accountId = searchResult[0].id;
                role.owner.accountName = searchResult[0].name;
                role.owner.displayName = searchResult[0].displayName;
                role.currentOwnerAccountName = searchResult[0].name;
                role.currentOwnerDisplayName = searchResult[0].displayName;
              }
              fetchedOwnerCount++;
              if (fetchedOwnerCount == roleCount) {
                this.allOwnersFetched = true;
              }
            });

          this.roles.push(role);
          this.rolesToShow.push(role);
        }
        this.loading = false;
      });
  }

  resetRolesToShow() {
    this.messageService.clearError();
    if (this.roles) {
      this.rolesToShow = [];
      this.roles.forEach(each => {
        const copy = new Role();
        Object.assign(copy, each);
        this.rolesToShow.push(copy);

      });
    }
  }

  changeOnBulkAction($event) {
    this.resetRolesToShow();
    if ($event && $event != '') {
      this.bulkAction = $event;
      if (this.bulkAction === 'EnableRoles') {
        this.rolesToShow = this.rolesToShow.filter(each => (!each.enabled));
      } else if (this.bulkAction === 'DisableRoles') {
        this.rolesToShow = this.rolesToShow.filter(each => (each.enabled));
      } else if (this.bulkAction === 'MakeRolesRequestable') {
        this.rolesToShow = this.rolesToShow.filter(each => (!each.requestable));
      } else if (this.bulkAction === 'MakeRolesNonRequestable') {
        this.rolesToShow = this.rolesToShow.filter(each => (each.requestable));
      }
    } else {
      this.bulkAction = null;
    }
    this.unselectAll();
  }

  unselectAll() {
    this.selectAll = false;
    this.atLeastOneSelected = false;
    this.rolesToShow.forEach(each => each.selected = false);
  }

  changeOnSelectAll() {
    this.messageService.clearError();
    this.searchText = null;
    this.rolesToShow.forEach(each => each.selected = !this.selectAll);
  }

  changeOnSelect($event) {
    this.messageService.clearError();
    if (!$event.currentTarget.checked) {
      this.selectAll = false;
    }
  }

  showSubmitConfirmModal() {
    this.messageService.clearError();
    this.invalidMessage = [];
    this.atLeastOneSelected = false;
    for (const each of this.rolesToShow) {
      if (each.selected) {
        this.atLeastOneSelected = true;
      }
    }
    this.submitConfirmModal.show();
  }

  hideSubmitConfirmModal() {
    this.submitConfirmModal.hide();
  }

  getSelectedRoles(): Role[] {
    const arr = [];
    for (const each of this.rolesToShow) {
      if (each.selected) {
        arr.push(each);
      }
    }
    return arr;
  }

  closeModalDisplayMsg() {
    if (!this.errorInvokeApi) {
      this.messageService.add("Changes saved successfully.");
    }
    this.submitConfirmModal.hide();
  }

  updateRoles(path: string, enabled: boolean) {
    const arr = this.getSelectedRoles();
    let processedCount = 0;
    for (const each of arr) {
      this.idnService.updateRole(each, path, enabled)
        .subscribe(() => {
          processedCount++;
          if (processedCount == arr.length) {
            this.closeModalDisplayMsg();
            this.reset(false);
            this.getAllRoles();
          }
        },
          err => {
            this.errorInvokeApi = true;
            this.messageService.handleIDNError(err);
            processedCount++;
            if (processedCount == arr.length) {
              this.closeModalDisplayMsg();
              this.reset(false);
              this.getAllRoles();
            }
          }
        );
    }
  }

  saveInCsv() {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useHeader: true,
      headers: [
        "name",
        "description",
        "id",
        "enabled",
        "requestable",
        "criteria",
        "criteriaDetail",
        "accessProfiles",
        "accessProfilesNames",
        "identityList",
        "ownerAccountID",
        "ownerDisplayName"],
      nullToEmptyString: true,
    };

    const currentUser = this.authenticationService.currentUserValue;
    const fileName = `${currentUser.tenant}-roles`;
    const arr = [];
    for (const each of this.roles) {
      const record = Object.assign(each);
      if (each.owner) {
        record.ownerAccountID = each.owner.accountName;
        record.ownerDisplayName = each.owner.displayName;
      }
      arr.push(record);
    }

    new AngularCsv(arr, fileName, options);
  }

  async deleteRoles() {
    this.messageService.clearAll();
    this.invalidMessage = [];
    if (this.deleteRoleConfirmText !== "YES TO DELETE") {
      this.invalidMessage.push("Text does not match");
      this.validToSubmit = false;
      return;
    }
    else {
      this.validToSubmit = true;
    }

    const arr = this.getSelectedRoles();
    let processedCount = 0;
    for (const each of arr) {
      this.idnService.deleteRole(each)
        .subscribe(async () => {
          processedCount++;
          if (processedCount == arr.length) {
            this.deleteRoleConfirmModal.hide();
            this.messageService.add("Roles deleted successfully.");
            this.hideSubmitConfirmModal();
            this.reset(false);
            await this.sleep(2000);
            this.getAllRoles();
          }
        },
          err => {
            this.errorInvokeApi = true;
            this.messageService.handleIDNError(err);
            processedCount++;
            if (processedCount == arr.length) {
              this.deleteRoleConfirmModal.hide();
              this.hideSubmitConfirmModal();
              this.messageService.handleIDNError(err);
            }
          }
        );
    }
  }

  showRoleRefreshSubmitConfirmModal() {
    this.messageService.clearError();
    this.validToSubmit = true;
    this.submitRoleRefreshConfirmModal.show();
  }

  hideRoleRefreshSubmitConfirmModal() {
    this.submitRoleRefreshConfirmModal.hide();
  }

  roleRefresh() {
    this.idnService.refreshAllRoles()
      .subscribe(() => {
        this.closeRoleRefreshModalDisplayMsg();
        this.reset(false);
        this.getAllRoles();
      });

  }

  closeRoleRefreshModalDisplayMsg() {
    if (this.errorMessage != null) {
      this.messageService.setError(this.errorMessage);
    } else {
      this.messageService.add("Org Role Refresh Kicked off. Please check Org -> Admin -> Dashboard -> Monitor");
    }
    this.submitRoleRefreshConfirmModal.hide();
  }

  hideDeleteRoleConfirmModal() {
    this.deleteRoleConfirmModal.hide();
    this.submitConfirmModal.hide();
  }

  showDeleteRoleConfirmModal() {
    this.invalidMessage = [];
    this.deleteRoleConfirmText = null;
    this.validToSubmit = false;
    this.deleteRoleConfirmModal.show();
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  exportAllRoles() {

    this.idnService.getAllRoles()
      .subscribe(
        results => {
          this.roles = [];
          for (const each of results) {
            const role = new Role();
            const jsonData = JSON.stringify(each, null, 4);
            role.name = each.name;
            const fileName = "Role - " + role.name + ".json";
            this.zip.file(`${fileName}`, jsonData);

          }
          const currentUser = this.authenticationService.currentUserValue;
          const zipFileName = `${currentUser.tenant}-roles.zip`;

          this.zip.generateAsync({ type: "blob" }).then(function (content) {
            saveAs(content, zipFileName);
          });

          this.ngOnInit();

        });
  }

}
