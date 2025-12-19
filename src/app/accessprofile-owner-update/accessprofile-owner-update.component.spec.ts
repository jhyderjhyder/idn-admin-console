import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChangeAccessProfileOwnerComponent } from './accessprofile-owner-update.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { MockIDNService } from '../service/idn.service.mock.spec';

describe('ChangeAccessProfileOwnerComponent', () => {
  let component: ChangeAccessProfileOwnerComponent;
  let fixture: ComponentFixture<ChangeAccessProfileOwnerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [ChangeAccessProfileOwnerComponent],
    imports: [FormsModule,
        ModalModule],
    providers: [
        IDNService,
        { provide: IDNService, useClass: MockIDNService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeAccessProfileOwnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
