import { StringLiteralLike } from "typescript";
import { SourceOwner } from "./source-owner";

export class AccessProfile {
    name: string;
    id: string;
    description: string;
    shortDescription: string;
    enabled: boolean;
    requestable: boolean;
    owner: SourceOwner;
    newOwner: SourceOwner;
    selected: boolean;
    entitlements: string[];
    currentOwnerAccountName: string;
    currentOwnerDisplayName: string;
    sourceName: string;
    entitlementList: string;
}
