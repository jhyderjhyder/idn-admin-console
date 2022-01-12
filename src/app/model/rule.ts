import { StringLiteralLike } from "typescript";

export class Rule {
    name: string;
    type: string;
    id: string;
    version: string;
    script: string;
    description: string;
    attributes: RuleAttribute;
}

export class RuleAttribute {
    ObjectOrientedScript: string;
    extension: string;
    disabled: string;
    program: string;
    timeout: string;
    sourceVersion: string;
}