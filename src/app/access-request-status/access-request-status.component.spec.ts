import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AccessRequestStatusComponent } from './access-request-status.component';

describe('AccessRequestStatusComponent', () => {
  let component: AccessRequestStatusComponent;
  let fixture: ComponentFixture<AccessRequestStatusComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessRequestStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessRequestStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
