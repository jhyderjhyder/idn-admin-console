import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReassignmentsComponent } from './reassignments.component';

describe('ReassignmentsComponent', () => {
  let component: ReassignmentsComponent;
  let fixture: ComponentFixture<ReassignmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReassignmentsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReassignmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
