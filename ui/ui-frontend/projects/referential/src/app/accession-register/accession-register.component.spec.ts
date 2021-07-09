import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessionRegisterComponent } from './accession-register.component';

describe('AccessionRegisterComponent', () => {
  let component: AccessionRegisterComponent;
  let fixture: ComponentFixture<AccessionRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccessionRegisterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessionRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
