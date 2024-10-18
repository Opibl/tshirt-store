import { TestBed } from '@angular/core/testing';

import { CARRITOService } from './carrito.service';

describe('CARRITOService', () => {
  let service: CARRITOService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CARRITOService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
