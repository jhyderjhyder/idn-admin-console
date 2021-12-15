import { Schedule } from ".././model/schedule";

export class Source {
  id: string;
  cloudExternalID: string;
  name: string;
  description: string;
  type: string;
  accountAggregationSchedule: Schedule;
  entitlementAggregationSchedule: Schedule;
  selected: boolean;
  newAccountAggCronExp: string;
  newEntitlmentAggCronExp: string;
}