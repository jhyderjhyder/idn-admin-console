import { Component, OnInit } from '@angular/core';
import { Source } from '../model/source';
import { Schedule } from '../model/schedule';
import { IDNService } from '../service/idn.service';

@Component({
  selector: 'app-aggregation-management',
  templateUrl: './aggregation-management.component.html',
  styleUrls: ['./aggregation-management.component.css']
})
export class AggregationManagementComponent implements OnInit {
  sources: Source[];
  sourcesToShow: Source[];
  bulkAction: string;
  selectAll: boolean;
  cronExpAll: string;
  errorMessage: string;
  searchText: string;

  constructor(private idnService: IDNService) { }

  ngOnInit() {
    this.reset();
    this.search();
  }

  reset() {
    this.sources = null;
    this.sourcesToShow = null;
    this.selectAll = false;
    this.bulkAction = null;
    this.cronExpAll = null;
    this.errorMessage = null;
  }

  search() {
    this.idnService.searchAggregationSources()
          .subscribe(searchResult => {
            this.sources = [];
            this.sourcesToShow = [];
            let allSources = searchResult.filter(each => (each.type && each.type != 'DelimitedFile'));

            for (let each of allSources) {
              let source = new Source();
              source.id = each.id;
              source.cloudExternalID = each.connectorAttributes.cloudExternalId;
              source.name = each.name;
              source.description = each.description;
              source.type = each.type;

              this.idnService.getAggregationSchedules(source.cloudExternalID)
                .subscribe(searchResult => { 
                  if (searchResult.length > 0) {
                    source.accountAggregationSchedule = new Schedule();
                    source.accountAggregationSchedule.enable = true;
                    source.accountAggregationSchedule.cronExp = searchResult[0].cronExpressions;
                  }
              });
        
              this.idnService.getEntitlementAggregationSchedules(source.cloudExternalID)
                .subscribe(searchResult => { 
                  if (searchResult.length > 0) {
                    source.entitlementAggregationSchedule = new Schedule();
                    source.entitlementAggregationSchedule.enable = true;
                    source.entitlementAggregationSchedule.cronExp = searchResult[0].cronExpressions;
                  }
              });
              
              this.sources.push(source);
              this.sourcesToShow.push(source);
            }
          });
  }

  resetSourcesToShow() {
    if (this.sources) {
      this.sourcesToShow = [];
      this.sources.forEach(each => this.sourcesToShow.push(each));
    }
  }

  showOnlyAggScheduledSources() {
    this.resetSourcesToShow();
    this.sourcesToShow = this.sourcesToShow.filter(each => ( each.accountAggregationSchedule && each.accountAggregationSchedule.enable) );
    this.bulkAction = "EnableAggSchedule";
    this.unselectAll();
  }

  showOnlyAggUnscheduledSources() {
    this.resetSourcesToShow();
    this.sourcesToShow = this.sourcesToShow.filter(each => ( each.accountAggregationSchedule == null || !each.accountAggregationSchedule.enable) );
    this.bulkAction = "DisableAggSchedule";
    this.unselectAll();
  }

  showOnlyEntAggScheduledSources() {
    this.resetSourcesToShow();
    this.sourcesToShow = this.sourcesToShow.filter(each => ( each.entitlementAggregationSchedule && each.entitlementAggregationSchedule.enable) );
    this.bulkAction = "EnableEntAggSchedule";
    this.unselectAll();
  }

  showOnlyEntAggUnscheduledSources() {
    this.resetSourcesToShow();
    this.sourcesToShow = this.sourcesToShow.filter(each => ( each.entitlementAggregationSchedule == null || !each.entitlementAggregationSchedule.enable) );
    this.bulkAction = "DisableEntAggSchedule";
    this.unselectAll();
  }

  unselectAll() {
    this.selectAll = false;
    this.sourcesToShow.forEach(each => each.selected = false);
  }

  changeOnSelectAll() {
    this.sourcesToShow.forEach(each => each.selected = !this.selectAll);
  }

}
