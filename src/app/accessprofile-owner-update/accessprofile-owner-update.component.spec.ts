import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChangeAccessProfileOwnerComponent } from './accessprofile-owner-update.component';

describe('ChangeAccessProfileOwnerComponent', () => {
  let component: ChangeAccessProfileOwnerComponent;
  let fixture: ComponentFixture<ChangeAccessProfileOwnerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeAccessProfileOwnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeAccessProfileOwnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
