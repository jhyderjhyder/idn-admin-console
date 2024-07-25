import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RawObjectComponent } from './raw-object.component';

describe('RawObjectComponent', () => {
  let component: RawObjectComponent;
  let fixture: ComponentFixture<RawObjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RawObjectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RawObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
