import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IdentityLCSComponent } from './identity-lcs-management.component';

describe('IdentityLCSComponent', () => {
  let component: IdentityLCSComponent;
  let fixture: ComponentFixture<IdentityLCSComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IdentityLCSComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentityLCSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
