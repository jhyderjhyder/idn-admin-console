import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { MockIDNService } from '../service/idn.service.mock.spec';
import { CloudRuleComponent } from './rule-cloud-management.component';

describe('CloudRuleComponent', () => {
  let component: CloudRuleComponent;
  let fixture: ComponentFixture<CloudRuleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CloudRuleComponent ],
      providers: [IDNService,
        { provide: IDNService, useClass: MockIDNService }],
        imports: [HttpClientModule, HttpClientTestingModule,FormsModule, ModalModule ]  
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloudRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
