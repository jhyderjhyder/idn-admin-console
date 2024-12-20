import { Account } from './account';
import { AccountActivities } from './accountactivities';
import { BasicAttributes2 } from './basic-attributes';
import { EntitlementSimple } from './entitlement-simple';

export class IdentityAttribute {
  displayName: string;
  extendedNumber: string;
  name: string;
  searchable: boolean;
  sources: string;
  type: string;
  indexedAttributes: string[];
  //Identity Info
  employeeNumber: string;
  email: string;
  id: string;
  created: string;
  modified: string;
  protected: boolean;
  isManager: string;
  identityProfile: string;
  accountCount: number;
  accountSourceNames: string;
  accountArray: Array<Account>;
  appCount: number;
  appNames: string;
  accessCount: number;
  entitlementCount: number;
  entitlementNames: string;
  entitlementArray: Array<EntitlementSimple>;
  roleCount: number;
  roleNames: string;
  roleArray: Array<BasicAttributes2>;
  accessProfileCount: number;
  accessProfileNames: string;
  accessProfileArray: Array<{}>;
  ownSources: number;
  ownSourcesNames: string;
  ownAccessProfiles: number;
  ownAccessProfilesNames: string;
  ownApps: number;
  ownAppsNames: string;
  ownRoles: number;
  ownRolesNames: string;
  ownGovernanceGroups: number;
  ownGovernanceGroupsNames: string;
  ownsAccessProfilesArray: Array<{}>;
  ownsSourcesArray: Array<{}>;
  ownsRolesArray: Array<{}>;
  ownsGovernanceGroupsArray: Array<{}>;
  tagsCount: number;
  tagNames: string;
  cloudLifecycleState: string;
  managerDisplayName: string;
  managerAccountName: string;
  orgPermission: string[];
  cloudStatus: string;
  attributes: Array<Basic>;
  hasPATToken: boolean;
  cloudId: string;
  activities: Array<AccountActivities>;
}

export class Basic {
  name: string;
  value: string;
}
