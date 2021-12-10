import { TestBed } from '@angular/core/testing';

import { IDNService } from './idn.service';

describe('DoctorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IDNService = TestBed.get(IDNService);
    expect(service).toBeTruthy();
  });
});
