import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IdentityProfileManagementComponent } from './identity-profile-management.component';

describe('IdentityProfileManagementComponent', () => {
  let component: IdentityProfileManagementComponent;
  let fixture: ComponentFixture<IdentityProfileManagementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IdentityProfileManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentityProfileManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
