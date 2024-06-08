export class RevokeRole {
  requestedFor: string[];
  requestType: string;
  requestedItems: RevokeRoleItem[];
}

export class RevokeRoleItem {
  type: string;
  id: string;
  comment: string;
}
