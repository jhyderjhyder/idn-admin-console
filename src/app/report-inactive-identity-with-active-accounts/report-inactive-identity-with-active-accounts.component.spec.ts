import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportInactiveIdentityWithActiveAccountsComponent } from './report-inactive-identity-with-active-accounts.component';

describe('ReportInactiveIdentityWithActiveAccountsComponent', () => {
  let component: ReportInactiveIdentityWithActiveAccountsComponent;
  let fixture: ComponentFixture<ReportInactiveIdentityWithActiveAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportInactiveIdentityWithActiveAccountsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(
      ReportInactiveIdentityWithActiveAccountsComponent
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
