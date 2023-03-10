import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DuplicateRoleComponent } from './role-duplicate.component';

describe('DuplicateRoleComponent', () => {
  let component: DuplicateRoleComponent;
  let fixture: ComponentFixture<DuplicateRoleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DuplicateRoleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicateRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
