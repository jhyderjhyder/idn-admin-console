import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EntitlmentOwnersComponent } from './entitlement-owners.component';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { MockIDNService } from '../service/idn.service.mock.spec';

describe('EntitlementOwnersComponent', () => {
  let component: EntitlmentOwnersComponent;
  let fixture: ComponentFixture<EntitlmentOwnersComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EntitlmentOwnersComponent],
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
    fixture = TestBed.createComponent(EntitlmentOwnersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
