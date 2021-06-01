import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementRuleArchiveSearchComponent } from './management-rule-archive-search.component';

describe('ManagementRuleArchiveSearchComponent', () => {
  let component: ManagementRuleArchiveSearchComponent;
  let fixture: ComponentFixture<ManagementRuleArchiveSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManagementRuleArchiveSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagementRuleArchiveSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
