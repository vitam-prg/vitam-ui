import { TestBed } from '@angular/core/testing';

import { PastisToogleButtonService } from './pastis-toogle-button.service';

describe('PastisToogleButtonService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PastisToogleButtonService = TestBed.get(PastisToogleButtonService);
    expect(service).toBeTruthy();
  });
});
