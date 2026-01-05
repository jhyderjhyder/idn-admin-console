import { Component, Injectable, OnInit } from '@angular/core';
import { BasicAttributes } from '../model/basic-attributes';
import { IDNService } from '../service/idn.service';
import { AuthenticationService } from '../service/authentication-service.service';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export abstract class NgbDateAdapter<D> {
  abstract fromModel(value: D): NgbDateStruct; // from your model -> internal model
}

@Component({
    selector: 'app-fast-tag',
    templateUrl: './fast-tag.component.html',
    styleUrls: ['./fast-tag.component.css'],
    standalone: false
})
export class FastTagComponent implements OnInit {
  constructor(
    private idnService: IDNService,
    private authenticationService: AuthenticationService,
    private calendar: NgbCalendar
  ) {}
  filterTypes: Array<BasicAttributes>;
  selectedObjectType: string;
  objectName: string;
  tagName: string;
  idAttribute: string;
  currentTags: Array<string>;
  showDate: boolean;

  date: NgbDateStruct = this.calendar.getToday();
  ngOnInit(): void {
    this.showDate = false;
    this.idAttribute = null;
    this.filterTypes = new Array<BasicAttributes>();
    const s = new BasicAttributes();
    s.name = 'SOURCE';
    s.value = 'SOURCE';
    this.filterTypes.push(s);
    this.selectedObjectType = s.name + ',' + s.value;

    const sM = new BasicAttributes();
    sM.name = 'SOURCE-MAINTENANCE';
    sM.value = 'SOURCE';
    this.filterTypes.push(sM);

    const r = new BasicAttributes();
    r.name = 'ROLE';
    r.value = 'ROLE';
    this.filterTypes.push(r);
    const currentUser = this.authenticationService.currentUserValue;
    console.log(currentUser);
  }
  submit() {
    console.log(
      'Tag:' +
        this.tagName +
        ' ObjectType:' +
        this.selectedObjectType +
        ' ObjectName:' +
        this.objectName
    );

    const lookup = this.selectedObjectType.split(',');
    let tag = this.tagName;
    if (lookup[0] == 'SOURCE-MAINTENANCE') {
      tag =
        'ETA_' +
        this.date.year.toString() +
        '_' +
        this.date.month.toString() +
        '_' +
        this.date.day.toString();
      console.log('newTag:' + tag);
    }
    console.log(lookup[1]);
    if (lookup[1] == 'SOURCE') {
      this.idnService
        .addTag(lookup[1], this.idAttribute, this.objectName, tag)
        .subscribe(searchResult => {
          console.log(searchResult);
          this.read();
        });
    }
    if (lookup[1] == 'ROLE') {
      this.idnService
        .addTag(lookup[1], this.idAttribute, this.objectName, tag)
        .subscribe(searchResult => {
          console.log(searchResult);
          this.read();
        });
    }
  }

  removeAllTag() {
    const lookup = this.selectedObjectType.split(',');
    this.idnService
      .deleteTag(lookup[1], this.idAttribute)
      .subscribe(searchResult => {
        console.log(searchResult);
        this.read();
      });
  }

  changePicker() {
    const lookup = this.selectedObjectType.split(',');
    if (lookup[0] == 'SOURCE-MAINTENANCE') {
      this.showDate = true;
    } else {
      this.showDate = false;
    }
  }

  read() {
    const lookup = this.selectedObjectType.split(',');
    console.log('calling read');
    //TODO add Identity/Roles
    this.checkTags('searching');
    this.idAttribute = null;
    if (lookup[1] == 'SOURCE') {
      this.idnService.getSourceByName(this.objectName).subscribe(allSources => {
        if (allSources != null) {
          for (const each of allSources) {
            this.idAttribute = each.id;
            this.checkTags(each.id);
          }
        }
      });
    }
    if (lookup[1] == 'ROLE') {
      this.idnService.getRoleByName(this.objectName).subscribe(allSources => {
        if (allSources != null) {
          for (const each of allSources) {
            this.idAttribute = each.id;
            this.checkTags(each.id);
          }
        }
      });
    }
  }

  checkTags(id) {
    const lookup = this.selectedObjectType.split(',');
    this.idnService.getTags(lookup[1], id).subscribe(myTag => {
      if (myTag != null) {
        this.currentTags = myTag.tags;
      } else {
        this.currentTags = ['none'];
      }
    });
  }
}
