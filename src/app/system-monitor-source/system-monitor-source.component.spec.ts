import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemMonitorSourceComponent } from './system-monitor-source.component';

describe('SystemMonitorSourceComponent', () => {
  let component: SystemMonitorSourceComponent;
  let fixture: ComponentFixture<SystemMonitorSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SystemMonitorSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SystemMonitorSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
