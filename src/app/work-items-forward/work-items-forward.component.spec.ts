import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WorkItemsPendingForwardComponent } from './work-items-forward.component';

describe('WorkItemsPendingForwardComponent', () => {
  let component: WorkItemsPendingForwardComponent;
  let fixture: ComponentFixture<WorkItemsPendingForwardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkItemsPendingForwardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkItemsPendingForwardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
