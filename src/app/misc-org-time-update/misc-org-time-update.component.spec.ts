import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { MockIDNService } from '../service/idn.service.mock.spec';
import { OrgTimeComponent } from './misc-org-time-update.component';

describe('OrgTimeComponent', () => {
  let component: OrgTimeComponent;
  let fixture: ComponentFixture<OrgTimeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [OrgTimeComponent],
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
    fixture = TestBed.createComponent(OrgTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
