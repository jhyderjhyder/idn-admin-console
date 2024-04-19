import { Component, OnInit, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { IdentityAttribute } from '../model/identity-attribute';

@Component({
  selector: 'app-identity-admin-management',
  templateUrl: './identity-admin-management.component.html',
  styleUrls: ['./identity-admin-management.component.css'],
})
export class IdentityAdminManagementComponent implements OnInit {
  identities: IdentityAttribute[];
  errorInvokeApi: boolean;
  searchText: string;
  loading: boolean;

  adminToRevoke: IdentityAttribute;
  validToSubmit: boolean;
  revokeAdminNameText: string;

  invalidMessage: string[];

  public modalRef: BsModalRef;

  @ViewChild('revokePermissionConfirmModal', { static: false })
  revokePermissionConfirmModal: ModalDirective;

  constructor(
    private idnService: IDNService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.reset(true);
    this.search();
  }

  reset(clearMsg: boolean) {
    this.identities = null;
    this.searchText = null;
    this.loading = false;
    this.adminToRevoke = null;
    this.validToSubmit = null;
    this.revokeAdminNameText = null;
    this.invalidMessage = [];
    if (clearMsg) {
      this.messageService.clearAll();
      this.errorInvokeApi = false;
    }
  }

  search() {
    this.loading = true;
    this.idnService.getIDNAdmins().subscribe(allAdmins => {
      this.identities = [];
      for (const each of allAdmins.body) {
        const identity = new IdentityAttribute();
        identity.protected = each.protected;
        if (!identity.protected) {
          identity.id = each.id;
          identity.displayName = each.displayName;
          identity.name = each.name;
          identity.created = each.created;
          identity.modified = each.modified;
          identity.cloudStatus = each.status;

          this.idnService.getUserPAT(each.id).subscribe(hasPat => {
            if (hasPat.length > 0) {
              identity.hasPATToken = true;
            } else {
              identity.hasPATToken = false;
            }
          });

          this.idnService.getV2IdentityID(each.name).subscribe(v2Identity => {
            identity.cloudId = v2Identity.id;
          });

          /*  this.idnService.getUserByAlias(each.name).subscribe(userDetail => {
            identity.orgPermission = userDetail.role;
          });
          */
          this.identities.push(identity);
        }
      }
      this.loading = false;
    });
  }

  revokePermission() {
    this.messageService.clearAll();
    this.invalidMessage = [];
    // validation
    if (this.revokeAdminNameText != this.adminToRevoke.id) {
      this.invalidMessage.push(
        'Confirmed User ID does not match chosen User ID!'
      );
      this.validToSubmit = false;
      return;
    } else {
      this.validToSubmit = true;
    }

    this.adminToRevoke.orgPermission.forEach(element => {
      this.idnService
        .revokeAdminPermission(this.adminToRevoke.cloudId, element)
        .subscribe(
          () => {
            this.revokePermissionConfirmModal.hide();
            this.messageService.add('Permission Revoked');
            this.adminToRevoke = null;
            this.reset(false);
            this.search();
          },
          err => {
            this.revokePermissionConfirmModal.hide();
            this.adminToRevoke = null;
            this.messageService.handleIDNError(err);
          }
        );
    });
  }

  showRevokePermissionsConfirmModal(selectedAdmin: IdentityAttribute) {
    this.invalidMessage = [];
    this.revokeAdminNameText = null;
    this.adminToRevoke = new IdentityAttribute();
    this.adminToRevoke.id = selectedAdmin.id;
    this.adminToRevoke.displayName = selectedAdmin.displayName;
    this.adminToRevoke.cloudId = selectedAdmin.cloudId;
    this.adminToRevoke.orgPermission = selectedAdmin.orgPermission;
    this.validToSubmit = false;
    this.revokePermissionConfirmModal.show();
  }

  hideRevokePermissionConfirmModal() {
    this.revokePermissionConfirmModal.hide();
  }
}
