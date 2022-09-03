import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SourceInfoComponent } from './source-info.component';

describe('SourceInfoComponent', () => {
  let component: SourceInfoComponent;
  let fixture: ComponentFixture<SourceInfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SourceInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SourceInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
