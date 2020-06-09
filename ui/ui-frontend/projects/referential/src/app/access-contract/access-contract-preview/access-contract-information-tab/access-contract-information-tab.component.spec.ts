import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessContractInformationTabComponent } from './access-contract-information-tab.component';
import {NO_ERRORS_SCHEMA} from "@angular/core";
import { AccessContractService } from '../../access-contract.service';
import { FormBuilder } from '@angular/forms';
import { AccessContractCreateValidators } from '../../access-contract-create/access-contract-create.validators';

// TODO fix test
xdescribe('AccessContractInformationTabComponent', () => {
  let component: AccessContractInformationTabComponent;
  let fixture: ComponentFixture<AccessContractInformationTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessContractInformationTabComponent ],
      providers:[
        FormBuilder,
        AccessContractCreateValidators,
        {provide:AccessContractService, useValue:{} },
        {provide:AccessContractService, useValue:{} }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessContractInformationTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
