import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';
import { Papa } from 'ngx-papaparse';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';
import { AuthenticationService } from '../service/authentication-service.service';
import { Role } from '../model/role';
import { SimpleQueryCondition } from '../model/simple-query-condition';
import { SourceOwner } from '../model/source-owner';

const RoleDescriptionMaxLength = 50;

@Component({
  selector: 'app-role-owner-update',
  templateUrl: './role-owner-update.component.html',
  styleUrls: ['./role-owner-update.component.css'],
})
export class ChangeRoleOwnerComponent implements OnInit {
  private isNavigating = false;
  private abortController = new AbortController();

  roles: Role[];
  loading: boolean;
  allOwnersFetched: boolean;
  searchText: string;
  selectAll: boolean;
  newOwnerAll: string;
  errorMessage: string;
  invalidMessage: string[];
  validToSubmit: boolean;
  roleCount: number;
  defaultLimit = 50; //default limit for Roles API is 50
  retryDelay = 3000; //retry delay for 3 seconds
  maxRetries = 5; // Number of times to retry
  loadedCount: number;

  public modalRef: BsModalRef;

  @ViewChild('submitConfirmModal', { static: false })
  submitConfirmModal: ModalDirective;
  @ViewChild('submitRoleRefreshConfirmModal', { static: false })
  submitRoleRefreshConfirmModal: ModalDirective;

  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  constructor(
    private papa: Papa,
    private idnService: IDNService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit() {
    this.reset(true);
    this.getAllRoles();
  }

  public ngOnDestroy() {
    this.isNavigating = true;
    this.abortController.abort();
    this.roles = [];
  }

  reset(clearMsg: boolean) {
    this.roles = [];
    this.selectAll = false;
    this.newOwnerAll = null;
    this.searchText = null;
    this.loading = false;
    this.allOwnersFetched = false;
    this.invalidMessage = [];
    this.roleCount = null;
    this.loadedCount = null;
    if (clearMsg) {
      this.messageService.clearAll();
      this.errorMessage = null;
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
          // After processing every batch (10 roles), wait for 1 second before calling another API to avoid 429
          // Too Many Requests Error
          await this.sleep(1000);
        }
        index++;

        const role = new Role();
        role.id = each.id;
        role.name = each.name;
        if (each.description) {
          if (each.description.length > RoleDescriptionMaxLength) {
            role.description =
              each.description.substring(0, RoleDescriptionMaxLength) + '...';
          } else {
            role.description = each.description;
          }
        }
        role.id = each.id;
        role.enabled = each.enabled;
        role.requestable = each.requestable;
        if (each.membership && each.membership.criteria != null) {
          role.criteria = true;
        } else {
          role.criteria = false;
        }

        role.accessProfiles = each.accessProfiles.length;

        if (!this.isNavigating) {
          const query = new SimpleQueryCondition();
          query.attribute = 'id';
          query.value = each.owner.id;

          const searchResult = await this.idnService
            .searchAccounts(query)
            .toPromise();
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
        }

        this.roles.push(role);
        this.loadedCount = this.roles.length;
      }
    } catch (error) {
      console.error(error);
    }
    this.loading = false;
  }

  public async getAllRolesData(): Promise<any> {
    const countResponse = await this.idnService
      .getTotalRolesCount()
      .toPromise();
    const count = countResponse;
    const allData: Role[] = [];

    for (
      let offset = 0;
      allData.length < count && !this.isNavigating;
      offset += this.defaultLimit
    ) {
      const dataPage = await this.idnService
        .getAllRoles(offset, this.defaultLimit, {
          signal: this.abortController.signal,
        })
        .toPromise();
      allData.push(...dataPage);
    }

    return allData;
  }

  // private delay(ms: number): Observable<void> {
  //   return timer(ms).pipe(mapTo(undefined));
  // }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  saveInCsv() {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useHeader: true,
      headers: [
        'name',
        'description',
        'id',
        'enabled',
        'requestable',
        'criteria',
        'accessProfiles',
        'ownerAccountID',
        'ownerDisplayName',
      ],
      nullToEmptyString: true,
    };

    const currentUser = this.authenticationService.currentUserValue;
    const fileName = `${currentUser.tenant}-roles-owners`;
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

  showSubmitConfirmModal() {
    this.messageService.clearError();
    this.validToSubmit = true;
    const selectedRoles = [];
    this.invalidMessage = [];
    for (const each of this.roles) {
      if (each.selected) {
        if (
          each.newOwner == null ||
          each.newOwner.accountName == null ||
          each.newOwner.accountName.trim() == ''
        ) {
          this.invalidMessage.push(
            `Owner of Role (name: ${each.name}) can not be empty.`
          );
          this.validToSubmit = false;
        } else if (each.newOwner.accountName == each.owner.accountName) {
          this.invalidMessage.push(
            `Owner of Role (name: ${each.name}) is not changed.`
          );
          this.validToSubmit = false;
        }

        selectedRoles.push(each);
      }
    }

    if (selectedRoles.length == 0) {
      this.invalidMessage.push('Select at least one item to submit.');
      this.validToSubmit = false;
    }

    if (this.validToSubmit) {
      let count = 0;
      //check if account name of new owner is valid
      for (const each of selectedRoles) {
        const query = new SimpleQueryCondition();
        query.attribute = 'name';
        query.value = each.newOwner.accountName;

        this.idnService.searchAccounts(query).subscribe(searchResult => {
          if (searchResult && searchResult.length == 1) {
            each.newOwner.accountId = searchResult[0].id;
            each.newOwner.displayName = searchResult[0].displayName;
          } else {
            this.validToSubmit = false;
            this.invalidMessage.push(
              `New owner's account name (${each.newOwner.accountName}) of Role (${each.name}) is invalid.`
            );
          }
          count++;
          if (count == selectedRoles.length) {
            this.submitConfirmModal.show();
          }
        });
      }
    } else {
      this.submitConfirmModal.show();
    }
  }

  applyNewOwnerToAllSelected() {
    this.messageService.clearError();
    if (this.newOwnerAll && this.newOwnerAll.trim() != '') {
      let anythingSelected = false;
      for (const each of this.roles) {
        if (each.selected) {
          if (each.newOwner == null) {
            each.newOwner = new SourceOwner();
          }
          each.newOwner.accountName = this.newOwnerAll;
          anythingSelected = true;
        }
      }
      if (!anythingSelected) {
        this.messageService.setError(
          'No item is selected to apply the new owner account name.'
        );
      }
    } else {
      this.messageService.setError(
        'Owner account name is required to apply to the selected items.'
      );
    }
  }

  changeOnSelectAll() {
    this.messageService.clearError();
    this.searchText = null;
    this.roles.forEach(each => {
      each.selected = !this.selectAll;
      if (each.selected) {
        if (each.newOwner == null) {
          each.newOwner = new SourceOwner();
        }
        each.newOwner.accountName = each.owner.accountName;
      } else {
        if (each.newOwner) {
          each.newOwner.accountName = null;
        }
      }
    });
  }

  changeOnSelect($event, index: number) {
    this.messageService.clearError();
    if (!$event.currentTarget.checked) {
      this.selectAll = false;
      if (this.roles[index].newOwner) {
        this.roles[index].newOwner.accountName = null;
      }
    } else {
      if (this.roles[index].newOwner == null) {
        this.roles[index].newOwner = new SourceOwner();
      }
      this.roles[index].newOwner.accountName =
        this.roles[index].owner.accountName;
    }
  }

  clearFileSelect() {
    this.messageService.clearError();
    this.fileInput.nativeElement.value = '';
  }

  hideSubmitConfirmModal() {
    this.submitConfirmModal.hide();
  }

  closeModalDisplayMsg() {
    if (this.errorMessage != null) {
      this.messageService.setError(this.errorMessage);
    } else {
      this.messageService.add('Changes saved successfully.');
    }
    this.submitConfirmModal.hide();
  }

  async updateRoleOwner() {
    const arr = this.roles.filter(each => each.selected);
    let processedCount = 0;
    let index = 0;
    for (const each of arr) {
      if (index > 0 && index % 10 == 0) {
        // After processing every batch (10 roles), wait for 1 second before calling another API to avoid 429
        // Too Many Requests Error
        await this.sleep(1000);
      }
      index++;

      this.idnService.updateRoleOwner(each).subscribe(
        () => {
          processedCount++;
          if (processedCount == arr.length) {
            this.closeModalDisplayMsg();
            this.reset(false);
            this.getAllRoles();
          }
        },
        () => {
          this.errorMessage = 'Error to submit the changes.';
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

  handleFileSelect(evt) {
    this.messageService.clearError();
    const newOwnerAccountNameMap = {}; //key is role id, value is new owner account name
    const files = evt.target.files; // FileList object
    const file = files[0];
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (event: any) => {
      const csv = event.target.result; // Content of CSV file
      this.papa.parse(csv, {
        skipEmptyLines: true,
        header: true,
        complete: results => {
          for (let i = 0; i < results.data.length; i++) {
            const id = results.data[i].id;
            newOwnerAccountNameMap[id] = results.data[i].ownerAccountID;
          }

          let anythingSelected = false;
          let anythingMatched = false;

          for (const each of this.roles) {
            if (each.selected) {
              const newOwnerAccountName = newOwnerAccountNameMap[each.id];
              if (newOwnerAccountName && newOwnerAccountName != '') {
                each.newOwner.accountName = newOwnerAccountName;
                anythingMatched = true;
              }
              anythingSelected = true;
            }
          }
          if (!anythingSelected) {
            this.messageService.setError(
              'No item is selected to apply the change.'
            );
          } else if (!anythingMatched) {
            this.messageService.setError(
              'No role record in uploaded file is matched with the selected items.'
            );
          }
        },
      });
    };
  }
}
