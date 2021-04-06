import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PastisToggleButtonComponent } from './pastis-toggle-button.component';

describe('PastisToggleButtonComponent', () => {
  let component: PastisToggleButtonComponent;
  let fixture: ComponentFixture<PastisToggleButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PastisToggleButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PastisToggleButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
