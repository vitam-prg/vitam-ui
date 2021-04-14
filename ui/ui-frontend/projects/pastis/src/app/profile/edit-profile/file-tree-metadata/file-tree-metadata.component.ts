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
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, EventEmitter, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { FileService } from '../../../core/services/file.service';
import { CardinalityValues, MetadataHeaders } from 'projects/pastis/src/app/core/classes/models';
import { SedaService } from '../../../core/services/seda.service';
import { CardinalityConstants, DataTypeConstants, FileNode, ValueOrDataConstants, TypeConstants, FileNodeInsertParams, FileNodeInsertAttributeParams } from '../classes/file-node';
import { SedaElementConstants, SedaData } from '../classes/seda-data';
import { FileTreeMetadataService } from './file-tree-metadata.service';
import { PastisDialogData } from 'projects/pastis/src/app/shared/pastis-dialog/classes/pastis-dialog-data';
import { AttributesPopupComponent } from './attributes/attributes.component';
import { AttributeData } from './attributes/models/edit-attribute-models';
import { NotificationService } from 'projects/pastis/src/app/core/services/notification.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Router } from '@angular/router';
import {Subscription} from "rxjs";



@Component({
  selector: 'pastis-file-tree-metadata',
  templateUrl: './file-tree-metadata.component.html',
  styleUrls: ['./file-tree-metadata.component.scss'],
  // Encapsulation has to be disabled in order for the
  // component style to apply to the select panel.
  encapsulation: ViewEncapsulation.None,
})

export class FileTreeMetadataComponent {

  valueOrData = Object.values(ValueOrDataConstants);
  dataType = Object.values(DataTypeConstants);
  cardinalityList: string[];
  cardinalityLabels = Object.values(CardinalityConstants)

  //Mat table
  matDataSource: MatTableDataSource<MetadataHeaders>;

  @ViewChild('autosize', { static: false }) autosize: CdkTextareaAutosize;

  displayedColumns: string[] = ['nomDuChamp', 'valeurFixe', 'cardinalite', 'commentaire'];

  clickedNode: FileNode = {} as FileNode;

  sedaData: SedaData = {} as SedaData;

  // The seda node that has been opened from the left menu
  selectedSedaNode: SedaData;

  selectedCardinalities: string[];

  allowedSedaCardinalityList: string[][];

  cardinalityValues: CardinalityValues[] = [];

  regexPattern: string = "";

  patternType: string;

  rowIndex: number;

  hoveredElementId: number;

  buttonIsClicked: boolean;

  config: {};

  @Output()
  public insertItem: EventEmitter<FileNodeInsertParams> = new EventEmitter<FileNodeInsertParams>();

  @Output()
  public addNode: EventEmitter<FileNode> = new EventEmitter<FileNode>();

  @Output()
  public insertAttributes: EventEmitter<FileNodeInsertAttributeParams> = new EventEmitter<FileNodeInsertAttributeParams>();

  @Output()
  public removeNode: EventEmitter<FileNode> = new EventEmitter<FileNode>();

  private _fileServiceSubscription : Subscription;

  metadatadaValueFormControl = new FormControl('', [Validators.required, Validators.pattern(this.regexPattern)]);

  valueForm = this.fb.group({
    valeurFixe: ['', [Validators.pattern(this.regexPattern)]],
  });

  constructor(private fileService: FileService, private fileMetadataService: FileTreeMetadataService,
    private sedaService: SedaService, private fb: FormBuilder, private notificationService: NotificationService,
    private ngxLoader: NgxUiLoaderService, private router: Router) {
    this.config = {
      locale: 'fr',
      showGoToCurrent: false,
      firstDayOfWeek: 'mo',
      format: 'YYYY-MM-DD'
    };
  }

  ngOnInit() {
    //Subscription to fileNode service
    this.ngxLoader.startLoader('table-metadata');
    this._fileServiceSubscription=this.fileService.getCurrentFileTree().subscribe(fileTree => {
      if (fileTree) {
        this.clickedNode = fileTree[0];
        this.fileService.allData.next(fileTree);
        // Subscription to sedaRules
        this.sedaService.getSedaRules().subscribe((data: any) => {
          if (this.clickedNode) {
            let rulesFromService = this.fileService.tabChildrenRulesChange.getValue();
            let tabChildrenToInclude = rulesFromService[0];
            let tabChildrenToExclude = rulesFromService[1];
            this.sedaService.selectedSedaNode.next(data[0]);
            this.selectedSedaNode = data[0];
            this.fileService.nodeChange.next(this.clickedNode)
            let filteredData = this.fileService.filteredNode.getValue();
            // Initial data for metadata table based on rules defined by tabChildrenRulesChange
            if (filteredData) {
              let dataTable = this.fileMetadataService.fillDataTable(this.selectedSedaNode, filteredData, tabChildrenToInclude, tabChildrenToExclude);
              this.matDataSource = new MatTableDataSource<MetadataHeaders>(dataTable);
            }
          }
        })
      }
    })

    this.fileMetadataService.selectedCardinalities.subscribe(cards => {
      this.selectedCardinalities = cards;
    });

    // File node
    this.fileService.nodeChange.subscribe(node => {
      this.clickedNode = node;
    })

    // Get Current sedaNode
    this.sedaService.selectedSedaNode.subscribe(sedaNode => {
      this.selectedSedaNode = sedaNode;
    })
    this.fileMetadataService.dataSource.subscribe(data => {
      this.matDataSource = new MatTableDataSource<MetadataHeaders>(data);
    })
    // Stop spinner
    this.ngxLoader.stopLoader('table-metadata');
  }

  getMetadataInputPattern(type: string) {
    if (type === 'date') {
      this.regexPattern = '([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}';
      return this.regexPattern;
    }
    if (type === 'TextType' || type === null) {
      this.regexPattern = '^[a-zA-X0-9 ]*$';
      return this.regexPattern;
    }
  }

  getMetadataInputType(element: MetadataHeaders) {
    if (element.type === 'date') {
      return 'date';
    }
    if (element.enumeration.length > 0) {
      return 'enumeration';
    }
  }

  findCardinality(event: any) {

    if (!event) {
      return CardinalityConstants.Obligatoire;
    } else {
      return event;
    }

  }

  isSedaCardinalityConform(cardList: string[], card: string) {
    return cardList.includes(card);
  }

  findCardinalityName(clickedNode: FileNode) {
    if (!clickedNode.cardinality) {
      return "1"
    } else {
      return this.cardinalityValues.find(c => c.value == clickedNode.cardinality).value
    }
  }

  setNodeChildrenCardinalities(metadata: MetadataHeaders, newCard: string) {
    if (this.clickedNode.name === metadata.nomDuChamp && this.clickedNode.id === metadata.id) {
      this.clickedNode.cardinality = newCard;
    } else if (this.clickedNode.children.length > 0) {
      let childNode = this.fileService.getFileNodeById(this.clickedNode, metadata.id);
      if (childNode) {
        childNode.cardinality = newCard;
      }
    }

  }

  setNodeValue(metadata: MetadataHeaders, newValue: string) {
    let updatedValue = newValue.length > 0 ? newValue : null
    if (this.clickedNode.name === metadata.nomDuChamp) {
      this.clickedNode.value = updatedValue;
    } else if (this.clickedNode.children.length > 0) {
      let childNode = this.fileService.getFileNodeById(this.clickedNode, metadata.id);
      if (childNode) {
        childNode.value = updatedValue;
      }
    }
  }

  setDocumentation(metadata: MetadataHeaders, comment: string) {
    if (this.clickedNode.name === metadata.nomDuChamp && this.clickedNode.id === metadata.id) {
      comment ? this.clickedNode.documentation = comment : this.clickedNode.documentation = null;
    }
    else {
      for (let node of this.clickedNode.children) {
        if (node.name === metadata.nomDuChamp && node.id === metadata.id) {
          comment ? node.documentation = comment : node.documentation = null;
        }
      }
    }
  }

  isElementComplex(elementName: string) {
    let childFound = this.selectedSedaNode.Children.find(el => el.Name === elementName);
    if (childFound) {
      return childFound.Element === SedaElementConstants.complex;
    }
  }

  onAddNode() {
    if (this.clickedNode.name === 'DescriptiveMetadata') {
      console.log("Yes")
      let params: FileNodeInsertParams = {
        node: this.clickedNode,
        elementsToAdd: ['ArchiveUnit']
      }
      this.insertItem.emit(params);
      this.notificationService.showSuccess('La métadonnée ArchiveUnit a été ajoutée');

    } else {
      this.addNode.emit(this.clickedNode)
    }
  }

  async onEditAttributesClick(fileNodeId: number) {
    let popData = {} as PastisDialogData;
    let attributeFileNodeListToAdd: FileNode[] = [];
    let attributeFileNodeListToRemove: FileNode[] = [];

    if (fileNodeId) {
      popData.fileNode = this.fileService.findChildById(fileNodeId, this.clickedNode);
      popData.subTitleDialog = 'Edition des attributs de';
      popData.titleDialog = popData.fileNode.name;
      popData.width = '1120px';
      popData.component = AttributesPopupComponent
      popData.okLabel = "Valider"
      popData.cancelLabel = "Annuler"

      let popUpAnswer = <AttributeData[]>await this.fileService.openPopup(popData);
      console.log("The answer for edit attributte was ", popUpAnswer);

      if (popUpAnswer) {

        // Create a list of attributes to add
        popUpAnswer.filter(a => a.selected).forEach(attr => {
          let fileNode = {} as FileNode;
          fileNode.cardinality = attr.selected ? '1' : null;
          fileNode.value = attr.valeurFixe ? attr.valeurFixe : null;
          fileNode.documentation = attr.commentaire ? attr.commentaire : null;
          fileNode.name = attr.nomDuChamp;
          fileNode.type = TypeConstants.attribute;
          fileNode.sedaData = this.sedaService.findSedaChildByName(attr.nomDuChamp, popData.fileNode.sedaData);
          fileNode.children = [];
          fileNode.id = attr.id;
          attributeFileNodeListToAdd.push(fileNode);
        });
        // Create a list of attributes to remove
        popUpAnswer.filter(a => !a.selected).forEach(attr => {
          let fileNode: FileNode = {} as FileNode;
          fileNode.name = attr.nomDuChamp;
          attributeFileNodeListToRemove.push(fileNode);
        });
        if (attributeFileNodeListToAdd) {
          let insertOrEditParams: FileNodeInsertAttributeParams = { node: popData.fileNode, elementsToAdd: attributeFileNodeListToAdd }
          let attrsToAdd = attributeFileNodeListToAdd.map(e => e.name);
          let attributeExists = popData.fileNode.children.some(child => attrsToAdd.includes(child.name))

          //Add attribute (if it does not exist), or update them if they do
          if (attrsToAdd && !attributeExists) {
            this.insertAttributes.emit(insertOrEditParams);
          } else {
            this.fileService.updateNodeChildren(popData.fileNode, attributeFileNodeListToAdd)
          }
        }
        if (attributeFileNodeListToRemove.length) {
          this.fileService.removeItem(attributeFileNodeListToRemove, popData.fileNode);
        }
      }
    }
  }

  onDeleteNode(nodeId: number) {
    const nodeToDelete = this.fileService.getFileNodeById(this.fileService.nodeChange.getValue(), nodeId);
    this.removeNode.emit(nodeToDelete)
  }

  onButtonClicked(elementId: number) {
    this.hoveredElementId = elementId;
  }

  isButtonClicked(elementId: number, data: MetadataHeaders) {
    if (data) {
      this.hoveredElementId = elementId;
      this.buttonIsClicked = true;
      return data.id === this.hoveredElementId;
    }
  }

  isRowHovered(elementId: number) {
    return this.hoveredElementId === elementId;
  }

  onMouseOver(row: MetadataHeaders) {
    this.buttonIsClicked = false;
    this.hoveredElementId = row.id
  }

  onMouseLeave() {
    if (!this.buttonIsClicked) {
      this.hoveredElementId = 0;
    }
  }

  checkElementType(elementName?: string) {
    if (this.selectedSedaNode) {
      let nameToSearch = elementName ? elementName : this.sedaService.selectedSedaNode.getValue().Name;
      let nodeElementType = this.sedaService.checkSedaElementType(nameToSearch, this.selectedSedaNode);
      return nodeElementType === SedaElementConstants.complex;
    }
  }

  shouldLoadMetadataTable() {
    return this.fileMetadataService.shouldLoadMetadataTable.getValue();
  }

  /**
   * Returns a boolean if a given node has one or more attributes
   * regarding its seda specification
   * @param nodeName The node's name to be tested
   */
  hasAttributes(nodeName: string): boolean {

    const node = this.sedaService.findSedaChildByName(nodeName, this.selectedSedaNode);

    if (node && node.Children.length > 0) {
      return (node.Children.find(c => c.Element == SedaElementConstants.attribute) !== undefined);
    }
    return false;
  }


  isSedaObligatory(name: string): boolean {
    return this.sedaService.isSedaNodeObligatory(name, this.selectedSedaNode);
  }

  getSedaDefinition(elementName: string) {
    if (this.selectedSedaNode.Name === elementName) {
      return this.selectedSedaNode.Definition;
    } else {
      for (let node of this.selectedSedaNode.Children) {
        if (node.Name === elementName) {
          return node.Definition
        }
      }
    }
    return ""
  }

  resolveButtonLabel(node: FileNode) {
    if (node) {
      return node.name === 'DescriptiveMetadata' ? "Ajouter une UA" : "Ajouter une métadonnée"
    }
  }

  resolveCurrentNodeName() {
    if (this.clickedNode) {
      return this.clickedNode.name;
    }
  }

  goBack(){
    this.router.navigate(['/'],{skipLocationChange: false});
  }

  ngOnDestroy(){
    if(this._fileServiceSubscription!= null){
      this._fileServiceSubscription.unsubscribe();
    }
  }

}
