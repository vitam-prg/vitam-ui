import { Component, OnInit, Output, EventEmitter, Input, ViewChild, HostListener } from '@angular/core';
import { Ontology } from 'projects/vitamui-library/src/public-api';
import { MatTab, MatTabGroup, MatTabHeader } from "@angular/material/tabs";
import { OntologyInformationTabComponent } from "./ontology-information-tab/ontology-information-tab.component";
import { Observable } from "rxjs";
import { ConfirmActionComponent } from "vitamui-library";
import { MatDialog } from "@angular/material/dialog";
import { OntologyService } from "../ontology.service";

@Component({
  selector: 'app-ontology-preview',
  templateUrl: './ontology-preview.component.html',
  styleUrls: ['./ontology-preview.component.scss']
})
export class OntologyPreviewComponent implements OnInit {

  @Output()
  previewClose: EventEmitter<any> = new EventEmitter();

  isPopup: boolean;

  filterEvents(event: any): boolean {
    return event.outDetail && (
      event.outDetail.includes('STP_UPDATE_ONTOLOGY') ||
      event.outDetail.includes('STP_IMPORT_ONTOLOGY'));
  }

  @Input()
  inputOntology: Ontology;
  // tab indexes: info = 0; history = 2;
  tabUpdated: boolean[] = [false, false];
  @ViewChild('tabs', {static: false}) tabs: MatTabGroup;

  tabLinks: Array<OntologyInformationTabComponent> = [];
  @ViewChild('infoTab', {static: false}) infoTab: OntologyInformationTabComponent;

  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler(event: any) {
    if (this.tabUpdated[this.tabs.selectedIndex]) {
      event.preventDefault();
      this.checkBeforeExit();
      return '';
    }
  }

  constructor(private matDialog: MatDialog, private ontologyService: OntologyService) { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.tabs._handleClick = this.interceptTabChange.bind(this);
    this.tabLinks[0] = this.infoTab;
  }

  updatedChange(updated: boolean, index: number) {
    this.tabUpdated[index] = updated;
  }

  async checkBeforeExit() {
    if (await this.confirmAction()) {
      const submitOntologyUpdate: Observable<Ontology> = this.tabLinks[this.tabs.selectedIndex].prepareSubmit();

      submitOntologyUpdate.subscribe( () => {
        this.ontologyService.get(this.inputOntology.identifier).subscribe(
          response => {
            this.inputOntology = response;
          }
        );
      });
    } else {
      this.tabLinks[this.tabs.selectedIndex].resetForm(this.inputOntology);
    }
  }

  async interceptTabChange(tab: MatTab, tabHeader: MatTabHeader, idx: number) {
    if (this.tabUpdated[this.tabs.selectedIndex]) {
      await this.checkBeforeExit();
    }

    const args = [tab, tabHeader, idx];
    return MatTabGroup.prototype._handleClick.apply(this.tabs, args);
  }

  async confirmAction(): Promise<boolean> {
    let dialog = this.matDialog.open(ConfirmActionComponent, { panelClass: 'vitamui-confirm-dialog' });
    dialog.componentInstance.dialogType = 'changeTab';
    return await dialog.afterClosed().toPromise();
  };

  emitClose() {
    this.previewClose.emit();
  }

}
