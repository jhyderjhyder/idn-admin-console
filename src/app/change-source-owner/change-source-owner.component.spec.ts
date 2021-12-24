import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChangeSourceOwnerComponent } from './change-source-owner.component';

describe('AggregationManagementComponent', () => {
  let component: ChangeSourceOwnerComponent;
  let fixture: ComponentFixture<ChangeSourceOwnerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeSourceOwnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeSourceOwnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
