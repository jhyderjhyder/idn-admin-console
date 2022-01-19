import { StringLiteralLike } from "typescript";

export class Rule {
    name: string;
    type: string;
    id: string;
    version: string;
    script: string;
    description: string;
    attributes: {};
}
