import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PastisNoticeToggleButtonComponent } from './pastis-notice-toggle-button.component';

describe('PastisNoticeToggleButtonComponent', () => {
  let component: PastisNoticeToggleButtonComponent;
  let fixture: ComponentFixture<PastisNoticeToggleButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PastisNoticeToggleButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PastisNoticeToggleButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
