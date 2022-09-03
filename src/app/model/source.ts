import { Schedule } from ".././model/schedule";
import { SourceOwner } from ".././model/source-owner";
import { AggregationTask } from ".././model/aggregation-task";

export class Source {
  id: string;
  cloudExternalID: string;
  name: string;
  description: string;
  type: string;
  accountAggregationSchedule: Schedule;
  entAggregationSchedule: Schedule;
  selected: boolean;
  accountAggCronExp: string;
  entAggCronExp: string;
  owner: SourceOwner;
  currentOwnerAccountName: string;
  currentOwnerDisplayName: string;
  newOwner: SourceOwner;
  aggregateSourceFormData: FormData;
  aggSourceDisableOptimization: boolean;
  aggTask: AggregationTask;
  accountsCount: string;
  entitlementsCount: string;
  internalName: string;
  authoritative: string;
}