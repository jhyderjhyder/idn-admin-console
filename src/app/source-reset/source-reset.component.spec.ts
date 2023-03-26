import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ResetSourceComponent } from './source-reset.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { MockIDNService } from '../service/idn.service.mock.spec';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ResetSourceComponent', () => {
  let component: ResetSourceComponent;
  let fixture: ComponentFixture<ResetSourceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ResetSourceComponent],
      providers: [IDNService,
        { provide: IDNService, useClass: MockIDNService }],
      imports: [HttpClientModule, HttpClientTestingModule, FormsModule, ModalModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
