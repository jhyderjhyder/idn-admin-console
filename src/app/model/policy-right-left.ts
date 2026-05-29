export class PolicyRightLeft {
  name: string |undefined;
  description: string|undefined;
  side: string | undefined;
  entitlement: string | undefined;
  application: string | undefined;
}

export class SimplePolicy {
  name: string |undefined;
  description: string|undefined;
  rightleft: Array<PolicyRightLeft>;
  showDetails: boolean | true;
}
