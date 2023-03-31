import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IdentityAttributeIndexComponent } from './identity-attribute-index.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { MockIDNService } from '../service/idn.service.mock.spec';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('IdentityAttributeIndexComponent', () => {
  let component: IdentityAttributeIndexComponent;
  let fixture: ComponentFixture<IdentityAttributeIndexComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [IdentityAttributeIndexComponent],
      providers: [
        IDNService,
        { provide: IDNService, useClass: MockIDNService },
      ],
      imports: [
        HttpClientModule,
        HttpClientTestingModule,
        FormsModule,
        ModalModule,
      ],
    }).compileComponents();
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
