export class AccessRequestAudit {
  status: string;
  sources: string;
  created: string;
  modified: string;
  requester: string;
  recipient: string;
  applications: Array<AccessRequestAuditAccount>;
  id: string;
  errors: string;
  warnings: string;
}

export class AccessRequestAuditAccount {
  source: string;
  errors: string;
  status: string;
  accountId: string;
  op: string;
  name: string;
  value: string;
}

export class AccessRequestAuditAccountFull {
  source: string;
  errors: string;
  status: string;
  accountId: string;
  op: string;
  name: string;
  value: string;
  requester: string;
  recipient: string;
  created: string;
  modified: string;
  pk: string;
  trackingNumber: string;
}
