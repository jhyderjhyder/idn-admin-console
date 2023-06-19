export class WorkItem {
  id: string;
  requesterId: string;
  requesterDisplayName: string;
  ownerId: string;
  ownerName: string;
  created: string;
  description: string;
  state: string;
  type: string;
  remediationItems: string;
  approvalItems: string;
  ownerDisplayName: string;
  rawObject: object;
}
