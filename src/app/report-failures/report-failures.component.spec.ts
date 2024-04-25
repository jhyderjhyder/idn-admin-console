import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportFailuresComponent } from './report-failures.component';

describe('ReportFailuresComponent', () => {
  let component: ReportFailuresComponent;
  let fixture: ComponentFixture<ReportFailuresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportFailuresComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportFailuresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
