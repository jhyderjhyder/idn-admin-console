import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { MockIDNService } from '../service/idn.service.mock.spec';
import { ChangeRoleOwnerComponent } from './role-owner-update.component';

describe('ChangeRoleOwnerComponent', () => {
  let component: ChangeRoleOwnerComponent;
  let fixture: ComponentFixture<ChangeRoleOwnerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeRoleOwnerComponent ],
      providers: [IDNService,
        { provide: IDNService, useClass: MockIDNService }],
        imports: [HttpClientModule, HttpClientTestingModule,FormsModule, ModalModule ] 
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeRoleOwnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
