import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DuplicateRoleComponent } from './role-duplicate.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { MockIDNService } from '../service/idn.service.mock.spec';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DuplicateRoleComponent', () => {
  let component: DuplicateRoleComponent;
  let fixture: ComponentFixture<DuplicateRoleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DuplicateRoleComponent],
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
    fixture = TestBed.createComponent(DuplicateRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
