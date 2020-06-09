import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextInformationTabComponent } from './context-information-tab.component';
import { SecurityProfileService } from '../../../security-profile/security-profile.service';
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ContextService } from '../../context.service';
import { of } from 'rxjs';
import { VitamUICommonTestModule } from 'ui-frontend-common/testing';
import { MatSelectModule } from '@angular/material';

// TODO fix tests
xdescribe('ContextInformationTabComponent', () => {
  let component: ContextInformationTabComponent;
  let fixture: ComponentFixture<ContextInformationTabComponent>;

  beforeEach(async(() => {

    const securityProfileServiceMock = {
      getAll: () => of([])
    };

    TestBed.configureTestingModule({
      imports:[
        ReactiveFormsModule,
        VitamUICommonTestModule,
        MatSelectModule
      ],
      declarations: [ ContextInformationTabComponent ],
      providers: [
        FormBuilder,
        { provide: SecurityProfileService, useValue: securityProfileServiceMock },
        { provide: ContextService, useValue: {} }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContextInformationTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
