import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FastTagComponent } from './fast-tag.component';

describe('FastTagComponent', () => {
  let component: FastTagComponent;
  let fixture: ComponentFixture<FastTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FastTagComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FastTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
