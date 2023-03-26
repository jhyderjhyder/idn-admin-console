import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { MockIDNService } from '../service/idn.service.mock.spec';
import { ChangeSourceOwnerComponent } from './source-owner-update.component';

describe('AggregationManagementComponent', () => {
  let component: ChangeSourceOwnerComponent;
  let fixture: ComponentFixture<ChangeSourceOwnerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ChangeSourceOwnerComponent],
      providers: [IDNService,
        { provide: IDNService, useClass: MockIDNService }],
      imports: [HttpClientModule, HttpClientTestingModule, FormsModule, ModalModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeSourceOwnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
