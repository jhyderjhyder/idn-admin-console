import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OrgStatsComponent } from './misc-org-stats.component';

describe('OrgStatsComponent', () => {
  let component: OrgStatsComponent;
  let fixture: ComponentFixture<OrgStatsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
