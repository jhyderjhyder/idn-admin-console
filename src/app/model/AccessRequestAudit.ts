export class AccessRequestAudit {
  status: string;
  sources: string;
  created: string;
  modified: string;
  requester: string;
  recipient: string;
  applications: Array<AccessRequestAuditAccount>;
  id: string;
}

export class AccessRequestAuditAccount {
  source: string;
  errors: string;
  status: string;
  accountId: string;
  op: string;
  attributeRequest: Array<String>;
}
