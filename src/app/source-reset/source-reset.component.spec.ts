import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ResetSourceComponent } from './source-reset.component';

describe('ResetSourceComponent', () => {
  let component: ResetSourceComponent;
  let fixture: ComponentFixture<ResetSourceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ResetSourceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
