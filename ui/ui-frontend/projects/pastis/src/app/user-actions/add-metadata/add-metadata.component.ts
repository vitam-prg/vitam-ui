/*
Copyright © CINES - Centre Informatique National pour l'Enseignement Supérieur (2020) 

[dad@cines.fr]

This software is a computer program whose purpose is to provide 
a web application to create, edit, import and export archive 
profiles based on the french SEDA standard
(https://redirect.francearchives.fr/seda/).


This software is governed by the CeCILL-C  license under French law and
abiding by the rules of distribution of free software.  You can  use, 
modify and/ or redistribute the software under the terms of the CeCILL-C
license as circulated by CEA, CNRS and INRIA at the following URL
"http://www.cecill.info". 

As a counterpart to the access to the source code and  rights to copy,
modify and redistribute granted by the license, users are provided only
with a limited warranty  and the software's author,  the holder of the
economic rights,  and the successive licensors  have only  limited
liability. 

In this respect, the user's attention is drawn to the risks associated
with loading,  using,  modifying and/or developing or reproducing the
software by the user in light of its specific status of free software,
that may mean  that it is complicated to manipulate,  and  that  also
therefore means  that it is reserved for developers  and  experienced
professionals having in-depth computer knowledge. Users are therefore
encouraged to load and test the software's suitability as regards their
requirements in conditions enabling the security of their systems and/or 
data to be ensured and,  more generally, to use and operate it in the 
same conditions as regards security. 

The fact that you are presently reading this means that you have had
knowledge of the CeCILL-C license and that you accept its terms.
*/
import { Component, OnInit, TemplateRef, Pipe, PipeTransform } from '@angular/core';
import { SedaData, SedaElementConstants, SedaCardinalityConstants } from '../../profile/edit-profile/classes/seda-data';
import { FileNode } from '../../profile/edit-profile/classes/file-node';
import { FileService } from '../../core/services/file.service';
import { SedaService } from '../../core/services/seda.service';
import { MatDialogRef } from '@angular/material/dialog';
import { PastisDialogConfirmComponent } from '../../shared/pastis-dialog/pastis-dialog-confirm/pastis-dialog-confirm.component';
import { PastisDialogData } from '../../shared/pastis-dialog/classes/pastis-dialog-data';
import { PopupService } from '../../core/services/popup.service';

@Component({
  selector: 'pastis-user-action-add-metadata',
  templateUrl: './add-metadata.component.html',
  styleUrls: ['./add-metadata.component.scss']
})
export class UserActionAddMetadataComponent implements OnInit {

  btnIsDisabled: boolean;

  sedaData:SedaData;
  allowedChildren : SedaData[];
  allowedChildrenNames: string[];
  filterName:string;
  namesFiltered: any = [];
  sedaNodeFound: SedaData;
  selectedSedaNode:SedaData;
  addedItems:string[] = [];
  dialogData: PastisDialogData;

  atLeastOneIsSelected:boolean;
  customTemplate:TemplateRef<any>
  fileNode: FileNode;

  constructor(public dialogRef: MatDialogRef<PastisDialogConfirmComponent>,
    private fileService:FileService, private sedaService:SedaService,
    private popUpService: PopupService) { }

  ngOnInit() {
    this.fileService.nodeChange.subscribe(fileNode=>{this.fileNode = fileNode})

      this.sedaService.getSedaRules().subscribe((data: any) => {
        this.sedaData = data[0];

        this.sedaNodeFound = this.fileNode.sedaData;
        this.allowedChildren = this.sedaService.findSelectableElementList(this.sedaNodeFound,this.fileNode)
                                                .filter(e=>e.Element !== SedaElementConstants.attribute);
        this.allowedChildrenNames = this.allowedChildren.map(e=>e.Name);

      })

    // Subscribe observer to button status and
    // set the inital state of the ok button to disabled
    this.popUpService.btnYesShoudBeDisabled.subscribe(status=>{
      this.btnIsDisabled = status;
    })
  }

  selectSedaElement(selectedElements:string[]) {
    if (selectedElements.length) {
      this.selectedSedaNode = this.sedaService.getSedaNode(this.sedaData,selectedElements[0]);
    }
  }

  isElementSelected(elementName: string){
    if (this.addedItems){
      return this.addedItems.includes(elementName);
    }
  }

  onRemoveSelectedElement(elementName: string){
    //this.addedItems = this.addedItems.filter(el => el !== elementName);
    let indexOfElement = this.addedItems.indexOf(elementName)
    if (indexOfElement >= 0) {
      this.addedItems.splice(indexOfElement, 1);
    }
    let elementBackToTheList = this.allowedChildren.find(el=> el.Name === elementName);
    if (elementBackToTheList.Cardinality !== (SedaCardinalityConstants.zeroOrMore || SedaCardinalityConstants.oreOrMore)) {
      this.allowedChildrenNames.push(elementName);
    }
    let orderedNames = Object.values(this.allowedChildren.map(e=>e.Name));
    this.allowedChildrenNames.sort((a, b) => {
      return orderedNames.indexOf(a) - orderedNames.indexOf(b)
    })
    this.addedItems.length > 0 ? this.atLeastOneIsSelected = true : this.atLeastOneIsSelected = false 
    this.upateButtonStatusAndDataToSend();
  }

  onAddSelectedElement(elementName: string){
    let sedaNode = this.sedaService.findSedaChildByName(elementName, this.sedaNodeFound);
      this.addedItems.push(elementName);
      if (sedaNode.Cardinality !== (SedaCardinalityConstants.zeroOrMore || SedaCardinalityConstants.oreOrMore)) {
        this.allowedChildrenNames = this.allowedChildrenNames.filter(name=> {return name !== elementName});
      }
      this.addedItems.length > 0 ? this.atLeastOneIsSelected = true : this.atLeastOneIsSelected = false 
    this.upateButtonStatusAndDataToSend();
  }

  upateButtonStatusAndDataToSend(){
    this.popUpService.setPopUpDataOnClose(this.addedItems);
    this.popUpService.disableYesButton(!this.atLeastOneIsSelected)
  }

  onAllItemsAdded(){
    return this.allowedChildren.length === this.addedItems.length;
  }

  isElementComplex(elementName: string){
    let childFound = this.allowedChildren.find(el=> el.Name === elementName);
    if (childFound){
      return childFound.Element === SedaElementConstants.complex;
    }
  }

  getDefinition(elementName:string):string {
    let element = this.allowedChildren.find(child=> child.Name === elementName)
    return element ? element.Definition : '';
  }

  onYesClick(): void {
    console.log("Clicked ok on dialog : %o" , this.selectedSedaNode);
    
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

}

@Pipe({name: 'filterByName'})
export class FilterByNamePipe implements PipeTransform {
  transform(listOfNames: string[], nameToFilter: string): string[] {
    if(!listOfNames) return null;
    if(!nameToFilter) return listOfNames;

    return listOfNames.filter(name => name.toLowerCase().indexOf(nameToFilter.toLowerCase()) >= 0);
  }
}
