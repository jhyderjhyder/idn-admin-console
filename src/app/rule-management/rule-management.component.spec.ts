import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ImportRuleComponent } from './rule-management.component';

describe('ImportRuleComponent', () => {
  let component: ImportRuleComponent;
  let fixture: ComponentFixture<ImportRuleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportRuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
