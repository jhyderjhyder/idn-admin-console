export class AccessRequest {
  requestedFor: Array<String>;
  requestType: string;
  requestedItems?: Array<String>;
}

export class RequestedItems {
  type?: string;
  id: string;
  comment: string;
  clientMetadata: RequestedItemsMetaData;
}

export class RequestedItemsMetaData {
  requestedAppName?: string;
  requestedAppId?: string;
}
