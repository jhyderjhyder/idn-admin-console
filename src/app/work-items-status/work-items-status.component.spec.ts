import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WorkItemsStatusComponent } from './work-items-status.component';

describe('WorkItemsStatusComponent', () => {
  let component: WorkItemsStatusComponent;
  let fixture: ComponentFixture<WorkItemsStatusComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkItemsStatusComponent ]
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
