import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChangeAPOwnerComponent } from './change-ap-owner.component';

describe('ChangeAPOwnerComponent', () => {
  let component: ChangeAPOwnerComponent;
  let fixture: ComponentFixture<ChangeAPOwnerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeAPOwnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeAPOwnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
