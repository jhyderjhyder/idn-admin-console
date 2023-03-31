import { Component, OnInit, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { Role } from '../model/role';
import { SimpleQueryCondition } from '../model/simple-query-condition';
import { SourceOwner } from '../model/source-owner';

const RoleDescriptionMaxLength = 50;

@Component({
  selector: 'app-role-duplicate',
  templateUrl: './role-duplicate.component.html',
  styleUrls: ['./role-duplicate.component.css'],
})
export class DuplicateRoleComponent implements OnInit {
  roleToDuplicate: Role;
  newRoleName: string;
  errorInvokeApi: boolean;
  searchText: string;
  loading: boolean;
  invalidMessage: string[];

  allOwnersFetched: boolean;
  roles: Role[];
  validToSubmit: boolean;
  errorMessage: string;
  deleteRoleConfirmText: string;

  public modalRef: BsModalRef;

  @ViewChild('duplicateRoleConfirmModal', { static: false })
  duplicateRoleConfirmModal: ModalDirective;

  constructor(
    private idnService: IDNService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.reset(true);
    this.getAllRoles();
  }

  reset(clearMsg: boolean) {
    this.roleToDuplicate = null;
    this.newRoleName = null;
    this.searchText = null;
    this.loading = false;
    this.invalidMessage = [];

    this.allOwnersFetched = false;
    this.roles = null;
    this.errorMessage = null;
    this.deleteRoleConfirmText = null;
    if (clearMsg) {
      this.messageService.clearAll();
    }
  }

  getAllRoles() {
    this.allOwnersFetched = false;
    this.loading = true;
    this.idnService.getAllRoles().subscribe(allRoles => {
      this.roles = [];
      const roleCount = allRoles.length;
      let fetchedOwnerCount = 0;
      for (const each of allRoles) {
        const role = new Role();
        if (each.membership && each.membership.type == 'STANDARD') {
          role.id = each.id;
          role.name = each.name;
          if (each.description) {
            if (each.description.length > RoleDescriptionMaxLength) {
              role.shortDescription =
                each.description.substring(0, RoleDescriptionMaxLength) + '...';
            } else {
              role.description = each.description;
              role.shortDescription = each.description;
            }
          }

          role.duplicateOwner = JSON.stringify(each.owner);
          role.membership = JSON.stringify(each.membership);
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
              role.identityList = identityNames.join(';').toString();
            }
          }

          role.accessProfiles = each.accessProfiles.length;

          const accessProfileNames = [];

          if (each.accessProfiles) {
            for (const accessprofile of each.accessProfiles) {
              accessProfileNames.push(accessprofile.name);
            }
          }

          const query = new SimpleQueryCondition();
          query.attribute = 'id';
          query.value = each.owner.id;

          this.idnService.searchAccounts(query).subscribe(searchResult => {
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
        }
      }
      this.loading = false;
    });
  }

  duplicateRole() {
    this.messageService.clearAll();
    this.invalidMessage = [];
    // validation
    if (this.newRoleName == null) {
      this.invalidMessage.push('Must enter new role name');
      this.validToSubmit = false;
      return;
    } else {
      this.validToSubmit = true;
    }

    this.idnService
      .duplicateRole(this.roleToDuplicate, this.newRoleName)
      .subscribe(
        () => {
          this.duplicateRoleConfirmModal.hide();
          this.messageService.add('Role duplicated successfully.');
          this.roleToDuplicate = null;
          this.reset(false);
          this.getAllRoles();
        },
        err => {
          this.duplicateRoleConfirmModal.hide();
          this.roleToDuplicate = null;
          this.messageService.handleIDNError(err);
        }
      );
  }

  showDuplicateRoleConfirmModal(duplicateRole: Role) {
    this.invalidMessage = [];
    this.newRoleName = null;
    this.roleToDuplicate = new Role();
    this.roleToDuplicate.name = duplicateRole.name;
    this.roleToDuplicate.description = duplicateRole.description;
    this.roleToDuplicate.duplicateOwner = duplicateRole.duplicateOwner;
    this.roleToDuplicate.membership = duplicateRole.membership;
    this.validToSubmit = false;
    this.duplicateRoleConfirmModal.show();
  }

  hideDuplicateRoleConfirmModal() {
    this.duplicateRoleConfirmModal.hide();
  }
}
