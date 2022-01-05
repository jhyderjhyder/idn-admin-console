import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AggregateSourceComponent } from './aggregate-source.component';

describe('AggregateSourceComponent', () => {
  let component: AggregateSourceComponent;
  let fixture: ComponentFixture<AggregateSourceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AggregateSourceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AggregateSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
