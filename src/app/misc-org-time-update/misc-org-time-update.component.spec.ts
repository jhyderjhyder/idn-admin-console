import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OrgTimeComponent } from './misc-org-time-update.component';

describe('OrgTimeComponent', () => {
  let component: OrgTimeComponent;
  let fixture: ComponentFixture<OrgTimeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgTimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
