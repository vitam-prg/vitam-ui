import { TestBed } from '@angular/core/testing';

import { VitamUIRadioGroupService } from './vitamui-radio-group.service';

describe('VitamUIRadioGroupService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VitamUIRadioGroupService = TestBed.get(VitamUIRadioGroupService);
    expect(service).toBeTruthy();
  });
});
