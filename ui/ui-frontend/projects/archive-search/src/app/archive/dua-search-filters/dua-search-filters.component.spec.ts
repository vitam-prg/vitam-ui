import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DuaSearchFiltersComponent } from './dua-search-filters.component';

describe('DuaSearchFiltersComponent', () => {
  let component: DuaSearchFiltersComponent;
  let fixture: ComponentFixture<DuaSearchFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DuaSearchFiltersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DuaSearchFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
