import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AccessProfileManagementComponent } from './accessprofile-management.component';

describe('AccessProfileManagementComponent', () => {
  let component: AccessProfileManagementComponent;
  let fixture: ComponentFixture<AccessProfileManagementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessProfileManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessProfileManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
