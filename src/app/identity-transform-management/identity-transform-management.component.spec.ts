import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { MockIDNService } from '../service/idn.service.mock.spec';
import { IdentityTransformManagementComponent } from './identity-transform-management.component';

describe('IdentityTransformManagementComponent', () => {
  let component: IdentityTransformManagementComponent;
  let fixture: ComponentFixture<IdentityTransformManagementComponent>; 

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IdentityTransformManagementComponent ],
      providers: [IDNService,
        { provide: IDNService, useClass: MockIDNService }],
        imports: [HttpClientModule, HttpClientTestingModule,FormsModule, ModalModule ] 
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentityTransformManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
