import { TestBed } from '@angular/core/testing';

import { PuaService } from './pua.service';

describe('PuaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PuaService = TestBed.get(PuaService);
    expect(service).toBeTruthy();
  });
});
