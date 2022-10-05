import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IdentityTransformManagementComponent } from './identity-transform-management.component';

describe('IdentityTransformManagementComponent', () => {
  let component: IdentityTransformManagementComponent;
  let fixture: ComponentFixture<IdentityTransformManagementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IdentityTransformManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentityTransformManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
