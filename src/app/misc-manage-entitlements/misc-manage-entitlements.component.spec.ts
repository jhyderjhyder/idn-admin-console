import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ManageEntitlementsComponent } from './misc-manage-entitlements.component';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { MockIDNService } from '../service/idn.service.mock.spec';

describe('EntitlementOwnersComponent', () => {
  let component: ManageEntitlementsComponent;
  let fixture: ComponentFixture<ManageEntitlementsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ManageEntitlementsComponent],
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
    fixture = TestBed.createComponent(ManageEntitlementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
