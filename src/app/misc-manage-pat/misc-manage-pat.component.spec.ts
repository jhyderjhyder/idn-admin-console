import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ManagePATComponent } from './misc-manage-pat.component';

describe('ManagePATComponent', () => {
  let component: ManagePATComponent;
  let fixture: ComponentFixture<ManagePATComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagePATComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagePATComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
