import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthenticationService } from './authentication-service.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AuthenticationService', () => {
  let service: AuthenticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(AuthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
