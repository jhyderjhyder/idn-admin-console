import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthDashboardComponent } from './health-dashboard.component';

describe('HealthDashboardComponent', () => {
  let component: HealthDashboardComponent;
  let fixture: ComponentFixture<HealthDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HealthDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
