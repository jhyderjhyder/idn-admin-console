import { Component, OnInit, ViewChild } from '@angular/core';
import { interval } from 'rxjs/internal/observable/interval';
import { startWith, switchMap, takeWhile } from 'rxjs/operators';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Source } from '../model/source';
import { AggregationTask } from '../model/aggregation-task';
import { IDNService } from '../service/idn.service';
import { MessageService } from '../service/message.service';

@Component({
  selector: 'app-source-aggregation-run',
  templateUrl: './source-aggregation-run.component.html',
  styleUrls: ['./source-aggregation-run.component.css'],
})
export class AggregateSourceComponent implements OnInit {
  sources: Source[];
  selectAll: boolean;
  validToSubmit: boolean;
  invalidMessage: string[];
  errorMessage: string;
  searchText: string;
  loading: boolean;
  loadedCount: number;
  sourceCount: number;

  uploadError: string;
  uploadFilePath: string;
  submitted = false;

  public modalRef: BsModalRef;

  @ViewChild('submitConfirmModal', { static: false })
  submitConfirmModal: ModalDirective;

  constructor(
    private idnService: IDNService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.reset(true);
    this.search();
  }

  reset(clearMsg: boolean) {
    this.sources = null;
    this.selectAll = false;
    this.searchText = null;
    this.loading = false;
    this.loadedCount = null;
    this.sourceCount = null;
    this.invalidMessage = [];
    if (clearMsg) {
      this.messageService.clearAll();
      this.errorMessage = null;
    }
  }

  search() {
    this.loading = true;
    this.idnService.getAllSources().subscribe(async allSources => {
      this.sources = [];

      this.sourceCount = allSources.length;

      //Sort it alphabetically
      allSources.sort((a, b) => a.name.localeCompare(b.name));

      let index = 0;
      for (const each of allSources) {
        if (index > 0 && index % 10 == 0) {
          // After processing every batch (10 sources), wait for 1 second before calling another API to avoid 429
          // Too Many Requests Error
          await this.sleep(1000);
        }
        index++;

        const source = new Source();
        source.id = each.id;
        source.cloudExternalID = each.id;
        source.name = each.name;
        source.description = each.description;
        source.type = each.type;
        const aggTaskPollingStatus = this.idnService.getAggTaskPolling(
          source.cloudExternalID
        );
        if (aggTaskPollingStatus && aggTaskPollingStatus.completed) {
          source.aggTask = new AggregationTask();
          source.aggTask.id = aggTaskPollingStatus.taskId;
          this.pollAggTaskStatus(source);
        }

        this.sources.push(source);
        this.loadedCount = this.sources.length;
      }
      this.loading = false;
    });
  }

  changeOnSelectAll() {
    this.messageService.clearError();
    this.searchText = null;
    this.sources.forEach(each => {
      each.selected = !this.selectAll;
      if (!each.selected) {
        each.aggregateSourceFormData = null;
      }
    });
  }

  changeOnSelect($event, index: number) {
    this.messageService.clearError();
    if (!$event.currentTarget.checked) {
      this.selectAll = false;
      this.sources[index].aggregateSourceFormData = null;
    }
  }

  showSubmitConfirmModal() {
    this.messageService.clearError();
    this.validToSubmit = true;
    const selectedSources = [];
    this.invalidMessage = [];
    for (const each of this.sources) {
      if (each.selected) {
        if (each.type == 'DelimitedFile' || each.type == 'Non-Employee') {
          if (
            each.aggregateSourceFormData == null ||
            each.aggregateSourceFormData.get('file') == null
          ) {
            this.invalidMessage.push(
              `CSV file of Source (name: ${each.name}) needs to be uploaded.`
            );
            this.validToSubmit = false;
          }
        }
        selectedSources.push(each);
      }
    }
    if (selectedSources.length == 0) {
      this.invalidMessage.push('Select at least one item to submit.');
      this.validToSubmit = false;
    }
    this.submitConfirmModal.show();
  }

  hideSubmitConfirmModal() {
    this.submitConfirmModal.hide();
  }

  closeModalDisplayMsg() {
    if (this.errorMessage != null) {
      this.messageService.setError(this.errorMessage);
    } else {
      this.messageService.add(
        'Source Aggregation request was submitted successfully.'
      );
    }
    this.submitConfirmModal.hide();
  }

  async aggregateSource() {
    const arr = this.sources.filter(each => each.selected);
    let processedCount = 0;
    let index = 0;
    for (const each of arr) {
      if (each.aggregateSourceFormData == null) {
        each.aggregateSourceFormData = new FormData();
      }
      let disableOptimization = 'false';

      if (each.aggSourceDisableOptimization) {
        disableOptimization = 'true';
      }
      const payload = {
        disableOptimization: disableOptimization,
      };

      if (index > 0 && index % 10 == 0) {
        // After processing every batch (10 sources), wait for 1 second before calling another API to avoid 429
        // Too Many Requests Error
        await this.sleep(1000);
      }
      index++;

      this.idnService
        .aggregateSourceOwner(each.cloudExternalID, payload)
        .subscribe(
          searchResult => {
            processedCount++;
            each.aggTask = new AggregationTask();
            each.aggTask.id = searchResult.task.id;
            this.idnService.startAggTaskPolling(
              each.cloudExternalID,
              each.aggTask.id
            );

            if (processedCount == arr.length) {
              this.closeModalDisplayMsg();
              this.checkAggTaskStatus(arr);
              //  this.reset(false);
              //  this.search();
            }
          },
          () => {
            this.errorMessage =
              'Error to send request to aggregate the source.';
            processedCount++;
            if (processedCount == arr.length) {
              this.closeModalDisplayMsg();
              this.checkAggTaskStatus(arr);
              // this.reset(false);
              // this.search();
            }
          }
        );
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  onFileChange(event, index: number) {
    this.messageService.clearError();
    if (event.target.files.length > 0) {
      const file: File = event.target.files[0];
      if (this.validateFile(file.name)) {
        this.sources[index].aggregateSourceFormData = new FormData();
        this.sources[index].aggregateSourceFormData.append('file', file);

        this.cleanup();
      } else {
        this.messageService.setError('Only CSV files are allowed.');
      }
      this.uploadFilePath = file.name;
    }
  }

  private cleanup() {
    this.uploadFilePath = null;
    this.uploadError = null;
    this.submitted = false;
  }

  validateFile(name: String) {
    const ext = name.substring(name.lastIndexOf('.') + 1);
    return ext.toLowerCase() === 'csv';
  }

  populateAggTaskStatus(response, source: Source) {
    if (response) {
      if (source.aggTask == null) {
        source.aggTask = new AggregationTask();
      }
      source.aggTask.status = response.status;
      source.aggTask.startTime = response.start;
      source.aggTask.totalAccounts = response.totalAccounts;
      source.aggTask.processedAccounts = response.processedAccounts;
      if (
        response.processedAccounts &&
        response.totalAccounts &&
        response.totalAccounts > 0
      ) {
        source.aggTask.processedPct = Math.round(
          (100 * response.processedAccounts) / response.totalAccounts
        );
        if (source.aggTask.processedPct == 0) {
          source.aggTask.processedPct = 1;
        }
      } else {
        if (response.status == 'COMPconstED') {
          source.aggTask.processedPct = 100;
        } else {
          source.aggTask.processedPct = 1;
        }
      }
    }
    if (response && response.status != 'COMPconstED') {
      return true;
    } else {
      this.idnService.finishAggTaskPolling(source.cloudExternalID);
      return false;
    }
  }

  checkAggTaskStatus(sources: Source[]) {
    let index: number = 0;
    const waitMillSeconds = 3000;
    for (const source of sources) {
      setTimeout(() => {
        this.pollAggTaskStatus(source);
      }, waitMillSeconds + 1000 * index);
      index++;
    }
  }

  pollAggTaskStatus(source: Source) {
    interval(5000)
      .pipe(
        startWith(0),
        switchMap(() =>
          this.idnService.getAccountAggregationStatus(source.aggTask.id)
        ),
        takeWhile(response => this.populateAggTaskStatus(response, source))
      )
      .subscribe();
  }
}
