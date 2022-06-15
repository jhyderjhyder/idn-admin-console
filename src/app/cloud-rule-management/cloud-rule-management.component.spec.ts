import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CloudRuleComponent } from './cloud-rule-management.component';

describe('CloudRuleComponent', () => {
  let component: CloudRuleComponent;
  let fixture: ComponentFixture<CloudRuleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CloudRuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloudRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
