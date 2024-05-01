import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportTaskStatusComponent } from './report-task-status.component';

describe('ReportTaskStatusComponent', () => {
  let component: ReportTaskStatusComponent;
  let fixture: ComponentFixture<ReportTaskStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportTaskStatusComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportTaskStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
