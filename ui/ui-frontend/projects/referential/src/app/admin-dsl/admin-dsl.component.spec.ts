import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDslComponent } from './admin-dsl.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AdminDslService } from './admin-dsl.service';
import { AccessContractService } from '../access-contract/access-contract.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VitamUICommonTestModule } from 'ui-frontend-common/testing';
import { of } from 'rxjs';
import { InjectorModule, LoggerModule } from 'ui-frontend-common';
import { MatSelectModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('AdminDslComponent', () => {
  let component: AdminDslComponent;
  let fixture: ComponentFixture<AdminDslComponent>;

  const adminDslValue = {
    id: 'id',
    accessContract: 'AC-000001',
    dsl: {},
    response: {}
  }

  beforeEach(async(() => {

    const adminDslServiceMock = {
      getByDsl: () => of({})
    };
    const accessContractServiceMock = {
      getAllForTenant: () => of([])
    };
    const activatedRouteMock = {
      params: of( { tenantIdentifier: 1 } ),
      data: of({ appId: 'DSL_APP'})
    };
    
    TestBed.configureTestingModule({
      imports: 
      [ 
        ReactiveFormsModule,
        VitamUICommonTestModule,
        InjectorModule,
        LoggerModule.forRoot(),
        MatSelectModule,
        NoopAnimationsModule
      ],
      declarations: [ AdminDslComponent ],
      providers:[
        FormBuilder,
        { provide: Router, useValue: { } },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: AdminDslService, useValue: adminDslServiceMock },
        { provide: AccessContractService, useValue: accessContractServiceMock },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDslComponent);
    component = fixture.componentInstance;
    component.form.setValue(adminDslValue);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
