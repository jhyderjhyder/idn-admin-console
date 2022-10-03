import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IdentityAttributeIndexComponent } from './identity-attribute-index.component';

describe('IdentityAttributeIndexComponent', () => {
  let component: IdentityAttributeIndexComponent;
  let fixture: ComponentFixture<IdentityAttributeIndexComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IdentityAttributeIndexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentityAttributeIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
