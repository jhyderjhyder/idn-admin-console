import { Component, OnInit, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { Role } from '../model/role';
import { SimpleQueryCondition } from '../model/simple-query-condition';
import { SourceOwner } from '../model/source-owner';
import {
  take,
  retryWhen,
  delayWhen,
  defer,
  throwError,
  Observable,
  mapTo,
  timer,
} from 'rxjs';

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
  roleCount: number;
  defaultLimit = 50; //default limit for Roles API is 50
  retryDelay = 3000; //retry delay for 3 seconds
  maxRetries = 5; // Number of times to retry
  allRoleData: any;
  loadedCount: number;

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
    this.roleCount = null;
    this.loadedCount = null;

    this.allOwnersFetched = false;
    this.roles = null;
    this.errorMessage = null;
    this.deleteRoleConfirmText = null;
    if (clearMsg) {
      this.messageService.clearAll();
    }
  }

  async getAllRoles() {
    this.allOwnersFetched = false;
    this.loading = true;
    this.roleCount = 0;
    this.roles = [];
    let fetchedOwnerCount = 0;

    try {
      const data = await this.getAllRolesData();
      this.roleCount = data.length;

      //Sort it alphabetically
      data.sort((a, b) => a.name.localeCompare(b.name));

      let index = 0;
      for (const each of data) {
        if (index > 0 && index % 10 == 0) {
          // After processing every batch (10 roles), wait for 3 seconds before calling another API to avoid 429
          // Too Many Requests Error
          await this.sleep(3000);
        }
        index++;

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
              if (fetchedOwnerCount == this.roleCount) {
                this.allOwnersFetched = true;
              }
            });

            this.roles.push(role);
            this.loadedCount = this.roles.length;
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
    this.loading = false;
  }

  public async getAllRolesData(): Promise<any> {
    const count = await this.idnService
      .getTotalRolesCount()
      .pipe(take(1))
      .toPromise();
    const allData: Role[] = [];
    let retryCount = 0;

    for (let offset = 0; allData.length < count; offset += this.defaultLimit) {
      const dataPage = await this.idnService
        .getAllRoles(offset)
        .pipe(
          take(1),
          retryWhen(errors =>
            errors.pipe(
              delayWhen(() =>
                defer(() => {
                  if (retryCount >= this.maxRetries) {
                    return throwError('Max retries reached');
                  } else {
                    retryCount++;
                    console.warn(
                      `Rate limited. Retrying in ${this.retryDelay} seconds...`
                    );
                    return this.delay(this.retryDelay);
                  }
                })
              )
            )
          )
        )
        .toPromise();

      if (dataPage) {
        allData.push(...dataPage);
      } else {
        console.warn('No data received. Retrying...');
        offset -= this.defaultLimit;
      }
    }

    return allData;
  }

  private delay(ms: number): Observable<void> {
    return timer(ms).pipe(mapTo(undefined));
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
