import { TestBed, waitForAsync } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { MockIDNService } from './service/idn.service.mock.spec';
import { IDNService } from './service/idn.service';
import { Idle, IdleExpiry } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { MockExpiry } from './mock/mock-expiry.mock.spec';
import { MessagesComponent } from './messages/messages.component';
import { RouterModule } from '@angular/router';

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [AppComponent, MessagesComponent],
    imports: [FormsModule,
        ModalModule,
        RouterModule],
    providers: [
        IDNService,
        Idle,
        Keepalive,
        { provide: IdleExpiry, useClass: MockExpiry },
        { provide: IDNService, useClass: MockIDNService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
