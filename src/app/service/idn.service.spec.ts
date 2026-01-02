import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { IDNService } from './idn.service';
import { AuthenticationService } from './authentication-service.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('DoctorService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
    imports: [],
    providers: [AuthenticationService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
  );

  it('should be created', () => {
    const service: IDNService = TestBed.inject(IDNService);
    expect(service).toBeTruthy();
  });
});
