import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from 'projects/archive-search/src/environments/environment';
import { of } from 'rxjs';
import { BASE_URL, LogbookService, StartupService } from 'ui-frontend-common';
import { IngestService } from '../ingest.service';
import { IngestPreviewComponent } from './ingest-preview.component';

@Pipe({ name: 'truncate' })
class MockTruncatePipe implements PipeTransform {
  transform(value: number): number {
    return value;
  }
}
describe('IngestPreviewComponent', () => {
  let component: IngestPreviewComponent;
  let fixture: ComponentFixture<IngestPreviewComponent>;

  const startupServiceMock = {
    getArchivesSearchUrl: () => 'url archive ingest',
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [IngestPreviewComponent, MockTruncatePipe],
        imports: [HttpClientTestingModule, MatMenuModule, TranslateModule.forRoot()],
        providers: [
          { provide: LogbookService, useValue: {} },
          { provide: StartupService, useValue: startupServiceMock },
          { provide: IngestService, useIngestServiceValue: {} },
          { provide: ActivatedRoute, useValue: { params: of({ tenantIdentifier: 1 }), data: of({ appId: 'INGEST_MANAGEMENT_APP' }) } },
          { provide: environment, useValue: environment },
          { provide: BASE_URL, useValue: '/fake-api' },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(IngestPreviewComponent);
    component = fixture.componentInstance;
    component.ingest = {
      id: 'aeeaaaaaaoem5lyiaa3lialtbt3j6haaaaaq',
      data: {},
      agIdExt: {},
      events: [{ data: {} }],
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
