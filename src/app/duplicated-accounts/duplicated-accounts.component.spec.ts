import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DuplicatedAccountsComponent } from './duplicated-accounts.component';

describe('DuplicatedAccountsComponent', () => {
  let component: DuplicatedAccountsComponent;
  let fixture: ComponentFixture<DuplicatedAccountsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DuplicatedAccountsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicatedAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
