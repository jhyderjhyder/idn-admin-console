import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentityCompareComponent } from './identity-compare.component';

describe('IdentityCompareComponent', () => {
  let component: IdentityCompareComponent;
  let fixture: ComponentFixture<IdentityCompareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IdentityCompareComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IdentityCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
