import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleContainsEntComponent } from './role-contains-ent.component';

describe('RoleContainsEntComponent', () => {
  let component: RoleContainsEntComponent;
  let fixture: ComponentFixture<RoleContainsEntComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RoleContainsEntComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleContainsEntComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
