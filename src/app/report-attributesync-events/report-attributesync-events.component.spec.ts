import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportAttributesyncEventsComponent } from './report-attributesync-events.component';

describe('ReportAttributesyncEventsComponent', () => {
  let component: ReportAttributesyncEventsComponent;
  let fixture: ComponentFixture<ReportAttributesyncEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportAttributesyncEventsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportAttributesyncEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
