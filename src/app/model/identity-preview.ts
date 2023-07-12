export class IdentityPreview {
  identityId: String;
  identityAttributeConfig: IdentityPreviewAttributeConfig;
}

export class IdentityPreviewAttributeConfig {
  attributeTransforms: IdentityPreviewAttributeTransforms[];
}

export class IdentityPreviewAttributeTransforms {
  identityAttributeName: String = 'email';
  transformDefinition: IdentityPreviewTransformDefinition;
}

export class IdentityPreviewTransformDefinition {
  type: String = 'accountAttribute';
  attributes: IdentityPreviewAttributes;
}

export class IdentityPreviewAttributes {
  applicationId: String;
  applicationName: String;
  attributeName: String;
  sourceName: String;
  id: String;
  type: String = 'reference';
}

export class IdentityPreviewResults {
  name: String;
  value: String;
  previousValue: String;
  errorMessages: String;
}
