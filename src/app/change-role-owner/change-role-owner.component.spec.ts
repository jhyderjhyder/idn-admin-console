import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChangeRoleOwnerComponent } from './change-role-owner.component';

describe('ChangeRoleOwnerComponent', () => {
  let component: ChangeRoleOwnerComponent;
  let fixture: ComponentFixture<ChangeRoleOwnerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeRoleOwnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeRoleOwnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
