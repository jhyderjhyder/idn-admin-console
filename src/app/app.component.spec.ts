import { TestBed, waitForAsync } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
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
      declarations: [
        AppComponent, MessagesComponent
      ],
      providers: [IDNService, Idle, Keepalive,
        { provide: IdleExpiry, useClass: MockExpiry },
        { provide: IDNService, useClass: MockIDNService }],
      imports: [HttpClientModule, HttpClientTestingModule, FormsModule, ModalModule, RouterModule]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
