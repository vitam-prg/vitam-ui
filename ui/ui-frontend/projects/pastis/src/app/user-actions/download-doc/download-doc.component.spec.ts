import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadDocComponent } from './download-doc.component';

describe('DownloadDocComponent', () => {
  let component: DownloadDocComponent;
  let fixture: ComponentFixture<DownloadDocComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DownloadDocComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
