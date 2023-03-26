import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { MockIDNService } from '../service/idn.service.mock.spec';

import { AccessProfileManagementComponent } from './accessprofile-management.component';

describe('AccessProfileManagementComponent', () => {
  let component: AccessProfileManagementComponent;
  let fixture: ComponentFixture<AccessProfileManagementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AccessProfileManagementComponent],
      providers: [IDNService,
      { provide: IDNService, useClass: MockIDNService }],
      imports: [HttpClientModule, HttpClientTestingModule, FormsModule, ModalModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessProfileManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
