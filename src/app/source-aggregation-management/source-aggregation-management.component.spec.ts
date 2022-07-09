import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AggregationManagementComponent } from './source-aggregation-management.component';

describe('AggregationManagementComponent', () => {
  let component: AggregationManagementComponent;
  let fixture: ComponentFixture<AggregationManagementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AggregationManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AggregationManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
