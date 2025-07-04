import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportMostActiveComponent } from './report-most-active.component';

describe('ReportMostActiveComponent', () => {
  let component: ReportMostActiveComponent;
  let fixture: ComponentFixture<ReportMostActiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportMostActiveComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportMostActiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
