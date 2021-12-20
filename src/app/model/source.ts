import { Schedule } from ".././model/schedule";

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
}