import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportFailuresSourceComponent } from './report-failures-source.component';

describe('ReportFailuresSourceComponent', () => {
  let component: ReportFailuresSourceComponent;
  let fixture: ComponentFixture<ReportFailuresSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportFailuresSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportFailuresSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
