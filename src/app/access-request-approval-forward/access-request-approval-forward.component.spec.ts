import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AccessRequestApprovalForwardComponent } from './access-request-approval-forward.component';

describe('AccessRequestApprovalForwardComponent', () => {
  let component: AccessRequestApprovalForwardComponent;
  let fixture: ComponentFixture<AccessRequestApprovalForwardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessRequestApprovalForwardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessRequestApprovalForwardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
