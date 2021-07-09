import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {BASE_URL,ENVIRONMENT,InjectorModule,LoggerModule} from 'ui-frontend-common';
import {environment} from './../../../environments/environment';
import {AccessionRegistersApiService} from './accession-registers-api.service';


describe('AccessionRegisterApiService',() => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
      InjectorModule,
      LoggerModule.forRoot()
    ],
    providers: [
      {provide: BASE_URL,useValue: '/fake-api'},
      {provide: ENVIRONMENT,useValue: environment}
    ]
  }));

  it('should be created',() => {
    const service: AccessionRegistersApiService=TestBed.inject(AccessionRegistersApiService);
    expect(service).toBeTruthy();
  });
});
