export class AccessRequestStatus {
  accessName: string;
  accessType: string;
  state: string;
  requester: string;
  requestedFor: string;
  requesterComment: string;
  description: string;
  removeDate: string;
  created: string;
  requestType: string;
  sodViolationState: string;
  approvalDetails: Array<{}>;
  accessRequestPhases: Array<{}>;
  violationSize: number;
  id: string;
  raw: object;
}
