import { Component, OnInit } from '@angular/core';
import { BasicAttributes } from '../model/basic-attributes';
import { IDNService } from '../service/idn.service';
import { AuthenticationService } from '../service/authentication-service.service';

@Component({
  selector: 'app-fast-tag',
  templateUrl: './fast-tag.component.html',
  styleUrls: ['./fast-tag.component.css'],
})
export class FastTagComponent implements OnInit {
  constructor(
    private idnService: IDNService,
    private authenticationService: AuthenticationService
  ) {}
  filterTypes: Array<BasicAttributes>;
  selectedObjectType: string;
  objectName: string;
  tagName: string;
  idAttribute: string;
  currentTags: Array<string>;

  ngOnInit(): void {
    this.idAttribute = null;
    this.filterTypes = new Array<BasicAttributes>();
    const s = new BasicAttributes();
    s.name = 'SOURCE';
    s.value = 'SOURCE';
    this.filterTypes.push(s);
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
    console.log('processing');
    if (this.selectedObjectType == 'SOURCE') {
      this.idnService
        .addTag(
          this.selectedObjectType,
          this.idAttribute,
          this.objectName,
          this.tagName
        )
        .subscribe(searchResult => {
          console.log(searchResult);
          this.read();
        });
    }
    if (this.selectedObjectType == 'ROLE') {
      this.idnService
        .addTag(
          this.selectedObjectType,
          this.idAttribute,
          this.objectName,
          this.tagName
        )
        .subscribe(searchResult => {
          console.log(searchResult);
          this.read();
        });
    }
  }

  removeAllTag() {
    this.idnService
      .deleteTag(this.selectedObjectType, this.idAttribute)
      .subscribe(searchResult => {
        console.log(searchResult);
        this.read();
      });
  }

  read() {
    //TODO add Identity/Roles
    this.checkTags('searching');
    this.idAttribute = null;
    if (this.selectedObjectType == 'SOURCE') {
      this.idnService.getSourceByName(this.objectName).subscribe(allSources => {
        if (allSources != null) {
          for (const each of allSources) {
            this.idAttribute = each.id;
            this.checkTags(each.id);
          }
        }
      });
    }
    if (this.selectedObjectType == 'ROLE') {
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
    this.idnService.getTags(this.selectedObjectType, id).subscribe(myTag => {
      if (myTag != null) {
        this.currentTags = myTag.tags;
      } else {
        this.currentTags = ['none'];
      }
    });
  }
}
