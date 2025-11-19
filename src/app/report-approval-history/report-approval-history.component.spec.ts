import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportApprovalHistoryComponent } from './report-approval-history.component';

describe('ReportApprovalHistoryComponent', () => {
  let component: ReportApprovalHistoryComponent;
  let fixture: ComponentFixture<ReportApprovalHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportApprovalHistoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportApprovalHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
