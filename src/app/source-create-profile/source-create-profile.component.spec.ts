import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SourceCreateProfileComponent } from './source-create-profile.component';

describe('SourceCreateProfileComponent', () => {
  let component: SourceCreateProfileComponent;
  let fixture: ComponentFixture<SourceCreateProfileComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SourceCreateProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SourceCreateProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
