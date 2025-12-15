export class IdentityProfile {
  description: string;
  priority: string;
  authSourceName: string;
  identityRefreshRequired: boolean;
  identityCount: string;
  hasIdentityException: boolean;
  id: string;
  name: string;
  selected: boolean;
  newPriority: string;
  lcsDisplayName: string;
  lcsTechnicalName: string;
  lcsEnabled: string;
  lcsId: string;
  lcsIdentityCount: string;
}
export class LifecycleStates {
  id: string;
  enabled: boolean;
  technicalName: string;
  identityCount: number;
  identityState: string;
  action: string;
  sourceIds: [];
  sourceIdsCount;
  excludeSourceIds: [];
  allSources: boolean;

  raw: any;
  profileId: string;
}
