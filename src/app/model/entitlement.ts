import { SourceOwner } from './source-owner';

export class Entitlement {
  id: string;
  attribute: string;
  value: string;
  name: string;
  description: string;
  privileged: boolean;
  requestable: boolean;
  sourceName: string;
  ownerName: string;
  ownerId: string;
  created: string;
  selected: boolean;
  owner: SourceOwner;
  newOwner: SourceOwner;
  currentOwnerAccountName: string;
  currentOwnerDisplayName: string;
  displayName: string;
}
