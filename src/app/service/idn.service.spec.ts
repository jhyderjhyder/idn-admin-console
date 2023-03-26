import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { IDNService } from './idn.service';
import { AuthenticationService } from './authentication-service.service';

describe('DoctorService', () => {
  
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule ], 
    providers: [AuthenticationService],
  }));

  it('should be created', () => {
    const service: IDNService = TestBed.inject(IDNService);
    expect(service).toBeTruthy();
  });
}); 
