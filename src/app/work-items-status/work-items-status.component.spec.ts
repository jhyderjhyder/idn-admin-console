import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WorkItemsStatusComponent } from './work-items-status.component';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { MockIDNService } from '../service/idn.service.mock.spec';
import { SearchFilterPipe } from '../shared/search-filter.pipe';

describe('WorkItemsStatusComponent', () => {
  let component: WorkItemsStatusComponent;
  let fixture: ComponentFixture<WorkItemsStatusComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkItemsStatusComponent, SearchFilterPipe ], 
      providers: [IDNService, 
        { provide: IDNService, useClass: MockIDNService }],
        imports: [HttpClientModule, HttpClientTestingModule,FormsModule, ModalModule ]  
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkItemsStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
