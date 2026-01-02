import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EntitlementManagementComponent } from './misc-entitlement-management.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { MockIDNService } from '../service/idn.service.mock.spec';

describe('EntitlementOwnersComponent', () => {
  let component: EntitlementManagementComponent;
  let fixture: ComponentFixture<EntitlementManagementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [EntitlementManagementComponent],
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
    fixture = TestBed.createComponent(EntitlementManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
