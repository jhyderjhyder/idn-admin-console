import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IdentityAttributeIndexComponent } from './identity-attribute-index.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { IDNService } from '../service/idn.service';
import { MockIDNService } from '../service/idn.service.mock.spec';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('IdentityAttributeIndexComponent', () => {
  let component: IdentityAttributeIndexComponent;
  let fixture: ComponentFixture<IdentityAttributeIndexComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [IdentityAttributeIndexComponent],
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
    fixture = TestBed.createComponent(IdentityAttributeIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
