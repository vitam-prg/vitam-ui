/*
Copyright © CINES - Centre Informatique National pour l'Enseignement Supérieur (2020)

[dad@cines.fr]

This software is a computer program whose purpose is to provide
a web application to create, edit, import and export archive
profiles based on the french SEDA standard
(https://redirect.francearchives.fr/seda/)


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
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {NestedTreeControl} from '@angular/cdk/tree';
import {Component, Input, ViewChild,} from '@angular/core';
import {MatTreeNestedDataSource} from '@angular/material/tree';
import {BehaviorSubject, throwError} from 'rxjs';
import {SedaCardinalityConstants, SedaData, SedaElementConstants} from '../classes/seda-data';
import {SedaService} from '../../../core/services/seda.service';
import {NotificationService} from '../../../core/services/notification.service';
import {FileService} from '../../../core/services/file.service';
import {CardinalityConstants, DataTypeConstants, FileNode, TypeConstants} from '../classes/file-node';
import {FileTreeMetadataService} from '../file-tree-metadata/file-tree-metadata.service';
import {UserActionAddMetadataComponent} from '../../../user-actions/add-metadata/add-metadata.component';
import {PastisDialogData} from '../../../shared/pastis-dialog/classes/pastis-dialog-data';
import {UserActionRemoveMetadataComponent} from '../../../user-actions/remove-metadata/remove-metadata.component';

@Component({
  selector: 'pastis-file-tree',
  templateUrl: './file-tree.component.html',
  styleUrls: ['./file-tree.component.scss']
})
export class FileTreeComponent {

  @ViewChild('treeSelector', { static: true }) tree: any;
  @ViewChild('autosize', { static: false }) autosize: CdkTextareaAutosize;


  @Input()
  nestedTreeControl: NestedTreeControl<FileNode>;
  @Input()
  nestedDataSource: MatTreeNestedDataSource<FileNode>;
  @Input()
  rootElementName: string;
  @Input()
  rootElementShowName: string;
  @Input()
  childrenListToExclude: string[];
  @Input()
  childrenListToInclude: string[];
  @Input()
  shouldLoad: boolean;
  @Input()
  collectionName: string

  nodeToSend: FileNode;
  data: FileNode;
  newNodeName: string;
  sedaData: SedaData;
  treeData: FileNode[];
  curentRootTabName: string;
  parentNodeMap = new Map<FileNode, FileNode>();
  dataChange = new BehaviorSubject<FileNode>(null);
  rulesChange: string[][] = [];
  rootMetadataName: string;



  static archiveUnits: FileNode;
  static archiveUnitsNumber: number;
  static uaIdAndPosition = new Map<any, number>();


  constructor(private fileService: FileService, private loggingService: NotificationService,
    private fileMetadataService: FileTreeMetadataService,
    private sedaService: SedaService) { }

  ngOnInit() {

    if (this.shouldLoad) {
      this.sedaService.getSedaRules().subscribe((data: any) => {
        this.sedaData = data[0];
        this.sedaService.selectedSedaNode.next(data[0]);
        this.sedaService.selectedSedaNodeParent.next(this.sedaData);
        console.log("Init seda node on file tree : %o", this.sedaService.selectedSedaNode.getValue(), " on tab : ", this.rootElementName);
      })
      this.fileService.tabChildrenRulesChange.subscribe(rules => {
        this.rulesChange = rules;
      })
      this.fileService.collectionName.subscribe(collection => {
        this.collectionName = collection;
      })
      this.fileService.rootTabMetadataName.subscribe(metadataName => {
        this.rootMetadataName = metadataName;
      })

      this.fileService.dataChange.next(this.nestedDataSource.data);
    }
  }


  isAttribute(node: FileNode): boolean {
    return node ? node.type === TypeConstants[TypeConstants.attribute] : false;
  }

  getChildren = (node: FileNode) => node.children;

  hasNestedChild(nodeData: FileNode): boolean {
    return !nodeData.type;
  }

  /** Select the category so we can insert the new item. */
  async addNewItem(node: FileNode) {
    let dataToSendToPopUp = <PastisDialogData>{};
    dataToSendToPopUp.titleDialog = "Veuillez sélectionner une ou plusieurs métadonnées"
    dataToSendToPopUp.subTitleDialog = `Ajouter des métadonnées à "${node.name}"`, node.name;
    dataToSendToPopUp.fileNode = node;
    dataToSendToPopUp.width = '800px';
    dataToSendToPopUp.okLabel = "Ajouter les métadonnées";
    dataToSendToPopUp.cancelLabel = "Annuler";
    dataToSendToPopUp.component = UserActionAddMetadataComponent;
    dataToSendToPopUp.disableBtnOuiOnInit = true;
    const elementsToAdd = <string[]>await this.fileService.openPopup(dataToSendToPopUp);
    if (elementsToAdd) {
      //this.sedaService.selectedSedaNode.next(sedaNode);
      this.insertItem(node, elementsToAdd);
      elementsToAdd.length > 1 ?
        this.loggingService.showSuccess('Les métadonnées ' + elementsToAdd.join(', ') + ' ont été ajoutées') :
        this.loggingService.showSuccess('La métadonnée ' + elementsToAdd + ' a été ajoutée')
    }
  }

  /** Add an item (or a list of items) in the Tree */
  insertItem(parent: FileNode, elementsToAdd: string[]) {
    let elementsToAddFromSeda: SedaData[] = [];
    for (let element of elementsToAdd) {
      parent.sedaData.Children.forEach((child) => {
        if (child.Name === element) {
          elementsToAddFromSeda.push(child);
        }
      });
    }

    if (parent.children && elementsToAddFromSeda) {
      for (let element of elementsToAddFromSeda) {
        // 1. Define a new file node, its id and seda data;
        let newNode = {} as FileNode;
        let newId = window.crypto.getRandomValues(new Uint32Array(10))[0];
        let sedaChild = element;

        // 1.2. New node type is defined acording to the seda element type
        sedaChild.Element === SedaElementConstants.attribute ?
          newNode.type = TypeConstants.attribute :
          newNode.type = TypeConstants.element;
        // 1.3. Fill the missing new node data
        newNode.name = element.Name;
        newNode.id = newId;
        newNode.level = parent.level + 1;
        newNode.dataType = DataTypeConstants[sedaChild.Type as keyof typeof DataTypeConstants];
        newNode.parentId = parent.id;
        newNode.parent = parent;
        newNode.children = [];
        newNode.sedaData = sedaChild;
        newNode.cardinality = Object.values(CardinalityConstants).find(c => c.valueOf() === sedaChild.Cardinality);
        console.log("Parent node name: " + parent.name);
        console.log("New node  : ", newNode);

        //1.4. Update parent->children relashionship
        parent.children.push(newNode);
        this.parentNodeMap.set(newNode, parent);
        console.log("Seda children and file children: ", parent.sedaData.Children, parent.children);

        // 2. Insert all children of complex elements based on SEDA definition
        if (sedaChild.Element === SedaElementConstants.complex) {
          let childrenOfComplexElement: string[] = [];
          sedaChild.Children.forEach((child: { Cardinality: any; Name: string; }) => {
            if (child.Cardinality === SedaCardinalityConstants.one ||
              child.Cardinality === SedaCardinalityConstants.oreOrMore) {
              childrenOfComplexElement.push(child.Name);
            }
          })
          this.insertItem(newNode, childrenOfComplexElement);
        }
        // 3. Insert all olbigatory attributes of the added node, if there is
        if (sedaChild.Children.some((child: { Element: any; }) => child.Element === SedaElementConstants.attribute)) {
          let attributes: FileNode[] = [];
          sedaChild.Children.filter((c: { Element: any; }) => c.Element === SedaElementConstants.attribute).forEach((child: { Name: string; Element: any; Cardinality: any; }) => {
            let isAttributeAlreadyIncluded = newNode.children.some(nodeChild => nodeChild.name.includes(child.Name));
            // If the added node contains an obligatory attribute,
            // on its seda definition and the attribute is not already part of the node,
            // we then, build an attribute node based on the seda atribute defintion
            if (child.Element === SedaElementConstants.attribute &&
              child.Cardinality === SedaCardinalityConstants.one &&
              !isAttributeAlreadyIncluded) {
              let childAttribute = {} as FileNode;
              childAttribute.name = child.Name;
              childAttribute.cardinality = child.Cardinality === SedaCardinalityConstants.one ? '1' : null;
              childAttribute.sedaData = sedaChild;
              attributes.push(childAttribute);
            }
          })
          this.insertAttributes(newNode, attributes);
        }

      }
      // 4. Order elements according to seda definition
      let sedaChildrenName: string[] = [];
      parent.sedaData.Children.forEach((child: { Name: string; }) => {
        sedaChildrenName.push(child.Name);
      })
      parent.children.sort((a, b) => {
        return sedaChildrenName.indexOf(a.name) - sedaChildrenName.indexOf(b.name)
      })
      // 5. Update tree
      this.sendNodeMetadata(parent);
      console.log("New fileNode data is : %o", this.nestedDataSource.data)

      // 6. No more nodes to add
    } else {
      console.log('No More Nodes can be inserted : No node was selected or node name is invalid');
    }
  }

  insertAttributes(parent: FileNode, attributesToAdd: FileNode[]) {

    if (attributesToAdd) {
      for (let attribute of attributesToAdd) {
        //Only attributes with cardinality one will be included
        if (attribute.cardinality === SedaCardinalityConstants.one) {
          let newAttributeNode = {} as FileNode;
          let newId = window.crypto.getRandomValues(new Uint32Array(10))[0];
          newAttributeNode.name = attribute.name;
          newAttributeNode.id = newId;
          newAttributeNode.level = parent.level + 1;
          newAttributeNode.type = TypeConstants.attribute;
          newAttributeNode.dataType = DataTypeConstants[attribute.sedaData.Type as keyof typeof DataTypeConstants];
          newAttributeNode.parentId = parent.id;
          newAttributeNode.children = [];
          newAttributeNode.cardinality = !attribute.cardinality ? '1' : attribute.cardinality;
          newAttributeNode.documentation = attribute.documentation ? attribute.documentation : null;
          newAttributeNode.value = attribute.value ? attribute.value : null;
          newAttributeNode.sedaData = attribute.sedaData;
          newAttributeNode.parent = parent;
          parent.children.push(newAttributeNode);
          this.parentNodeMap.set(newAttributeNode, parent);
          console.log("Parent of attribute after insert is now : ", parent.children);
        }
      }
    }
  }
  sendNodeMetadata(node: FileNode): void {
    this.updateFileTree(node);
    this.updateMedataTable(node);
    if (node.name === 'DataObjectGroup') {
      let dataObjectPackageId = this.fileService.getFileNodeByName(node.parent, 'DataObjectPackage').id;
      this.renderChanges(node, dataObjectPackageId);
    }
    if (node.name === 'DescriptiveMetadata') {
      FileTreeComponent.archiveUnits = node;
      this.generateArchiveUnitsNumbers(node)
      this.renderChanges(node, node.id);
      console.log("Archive units : ", FileTreeComponent.archiveUnits)
    }
    else {

      this.renderChanges(node);
    }
  }

  generateArchiveUnitsNumbers(archiveUnit: FileNode): void {
    if (archiveUnit.name === 'DescriptiveMetadata') {
      const archiveUnitLevel  = archiveUnit.level - 1;
      FileTreeComponent.uaIdAndPosition.set(archiveUnitLevel , archiveUnit.id);
    }
    let counter = 0;
    archiveUnit.children.forEach(child => {
      if (child.name === 'ArchiveUnit') {
        counter++;
        const archiveUnitLevel  = archiveUnit.level - 1 + "." + counter;
        FileTreeComponent.uaIdAndPosition.set(archiveUnitLevel, child.id);
      }
    })
  }


  // Refresh Tree by opening an given node (option)
  // If the a node name is not prodived, the function will open the root tab element
  renderChanges(node: FileNode, nodeIdToExpand?: number) {
    let data: FileNode;
    if (nodeIdToExpand) {
      data = this.fileService.getFileNodeById(this.fileService.allData.getValue()[0], nodeIdToExpand);
    } else {
      let rootTabName = this.fileService.rootTabMetadataName.getValue();
      data = this.fileService.getFileNodeByName(this.fileService.allData.getValue()[0], rootTabName);
    }
    if (data) {
      let dataArray = [];
      dataArray.push(data);
      this.nestedDataSource.data = null;
      this.nestedDataSource.data = dataArray;
      this.nestedTreeControl.expand(node);
    }
  }

  updateMedataTable(node: FileNode) {
    let rulesFromService = this.fileService.tabChildrenRulesChange.getValue()
    let tabChildrenToInclude = rulesFromService[0];
    let tabChildrenToExclude = rulesFromService[1];
    this.fileService.nodeChange.next(node);
    this.sedaService.selectedSedaNode.next(node.sedaData);
    let dataTable = this.fileMetadataService.fillDataTable(node.sedaData, node, tabChildrenToInclude, tabChildrenToExclude);
    let hasAtLeastOneComplexChild = node.children.some(el => el.type === TypeConstants.element);

    if (node.sedaData.Element === SedaElementConstants.complex) {
      this.fileMetadataService.shouldLoadMetadataTable.next(hasAtLeastOneComplexChild);
      console.log("Filled data on table : ", dataTable, "...should load : ", this.fileMetadataService.shouldLoadMetadataTable.getValue());
      this.fileMetadataService.dataSource.next(dataTable);
    } else {
      this.fileMetadataService.shouldLoadMetadataTable.next(true);
      this.fileMetadataService.dataSource.next(dataTable);
    }
  }

  // Updates the nested tab root tree and the data tree
  updateFileTree(node: FileNode) {
    this.nestedDataSource.data[0] = node
    let allData = this.fileService.allData.getValue()[0]
    this.updateItem(node, allData);
  }

  sendNodeMetadataIfChildren(node: FileNode) {
    if (node.children.length) {
      this.sendNodeMetadata(node);
    }
  }

  isElementComplexAndHasChildren(node: FileNode) {
    return node.children.some(child => child.type === TypeConstants.element);
  }

  isElementComplex(node: FileNode) {
    return node.sedaData.Element === SedaElementConstants.complex;
  }


  onResolveName(node: FileNode) {
    /*     let archiveUnitNode = this.fileService.getFileNodeById(FileTreeComponent.archiveUnits,node.id) as FileNode;
      if (node.name === 'ArchiveUnit' && archiveUnitNode) {
        let nodeLevel = (FileTreeComponent.archiveUnits.children.indexOf(node) + 1);
        let parent = this.fileService.getFileNodeById(FileTreeComponent.archiveUnits,node.parentId)
        let parentLevel = parent.level - 2

        let archiveUnilNumber = nodeLevel > 0 ? nodeLevel : parentLevel
        let archiveUnitDecimal = parentLevel === 0 ? "" :  "." +parentLevel;
        return 'UA ' + archiveUnilNumber + archiveUnitDecimal ;
      } */
    return node.name;
  }

  async remove(node: FileNode) {
    let dataToSendToPopUp = <PastisDialogData>{};
    let nodeType = node.sedaData.Element == SedaElementConstants.attribute ? 'L\'attribut ' : 'La métadonnée '
    dataToSendToPopUp.titleDialog = "Voulez-vous supprimer " + nodeType + " \"" + node.name + "\" ?";
    dataToSendToPopUp.subTitleDialog = node.sedaData.Element == SedaElementConstants.attribute ?
      "Suppression d'un attribut" : "Suppression d'une métadonnée";
    dataToSendToPopUp.fileNode = node;
    dataToSendToPopUp.component = UserActionRemoveMetadataComponent;

    let popUpAnswer = <FileNode>await this.fileService.openPopup(dataToSendToPopUp);
    if (popUpAnswer) {
      let deleteTypeText = node.sedaData.Element == SedaElementConstants.attribute ? ' supprimé' : ' supprimée'
      this.removeItem(node, this.fileService.nodeChange.getValue());
      this.loggingService.showSuccess(nodeType + node.name + ' a été ' + deleteTypeText + ' avec succès');
    }
  }

  isSedaNodeObligatory(nodeName: string): boolean {
    if (this.sedaData) {
      for (let child of this.sedaData.Children) {
        if (child.Name === nodeName) {
          return child.Cardinality !== '1' ? true : false;
        }
      }
    }
  }

  buildFileTree(obj: object, level: number): FileNode[] {
    // This should recive Root node of Tree of Type FileNode
    // so we dont have to create a new node and use it as it is
    return Object.keys(obj).reduce<FileNode[]>((accumulator: FileNode[], key: keyof object) => {
      const value = obj[key];
      const node = {} as FileNode;
      node.id = level;
      node.level = level;
      node.name = key;
      node.parentId = null;
      if (value != null) {
        if (typeof value === 'object') {
          node.children = this.buildFileTree(value, level + 1);
        } else {
          node.type = value;
        }
      }
      return accumulator.concat(node);
    }, []);
  }

  /** Remove an item Tree node given a parent node and the child to be removed */
  removeItem(childToBeRemoved: FileNode, parentRootNode: FileNode) {
    //If the parentRoot is a reference to the child to be removed, we search for its parent from the root tab node
    let rootNode = parentRootNode.id === childToBeRemoved.id ? this.nestedDataSource.data[0] : parentRootNode;

    const parentNode = this.findParent(childToBeRemoved.parentId, rootNode);
    if (parentNode) {
      console.log("On removeItem with node : ", childToBeRemoved, "and parent : ", parentNode);
      const index = parentNode.children.indexOf(childToBeRemoved);
      if (index !== -1) {
        parentNode.children.splice(index, 1);
        this.parentNodeMap.delete(childToBeRemoved);
        this.dataChange.next(this.data);
      }
      console.log("Deleted node : ", childToBeRemoved, "and his parent : ", parentNode);
      this.sendNodeMetadata(parentNode);
    }
  }

  /** Update an item Tree node */
  updateItem(newRootNode: FileNode, allData: FileNode) {
    for (let idx in allData.children) {
      if (allData.children[idx].id === newRootNode.id) {
        allData.children[idx] = newRootNode;
      } else {
        this.updateItem(newRootNode, allData.children[idx]);
      }
    }
  }


  /** Find a parent tree node */
  findParent(id: number, parentNode: FileNode): FileNode {
    console.log("On findParent with parent node id : ", id, " and parent : ", parentNode);
    return this.fileService.getFileNodeById(parentNode, id)
  }

  findParentLevel(nodeToFind: FileNode): number {
    let parentNodeToSearch = this.nestedDataSource.data;
    for (let node of parentNodeToSearch) {
      // For nested elements
      if (this.rootElementName === node.name && this.rootElementName === nodeToFind.name &&
        parentNodeToSearch[0].name === node.name && parentNodeToSearch[0].id !== nodeToFind.id) {
        return 1;
      }
      return nodeToFind.level - node.level;
    }
  }

  // Checks if a node belongs to the clicked tab collection.
  // For a given node, searches the required node in the seda.json file and
  // returns true if the node's value of "Collection" is equal to the clicked tab
  isPartOfCollection(node: FileNode): boolean {
    return this.collectionName === node.sedaData.Collection.valueOf();
  }

  shouldBeOnTab(node: FileNode): boolean {
    let rootNodeName = this.fileService.rootTabMetadataName.getValue();
    let filteredNode = Object.assign({} as FileNode, this.nestedDataSource.data[0]);

    let includedDataObjectPackageChildren = ['DataObjectGroup', 'BinaryDataObject', 'PhysicalDataObject']
    if (rootNodeName === 'DataObjectPackage' && !includedDataObjectPackageChildren.includes(node.name)) {
      filteredNode.children = filteredNode.children.filter(child => child.name !== 'DescriptiveMetadata' &&
        child.name !== 'ManagementMetadata')
      let childFound = this.fileService.getFileNodeById(filteredNode, node.id)
      return childFound ? true : false;
    }
    if (rootNodeName === 'ArchiveTransfer') {
      filteredNode.children = filteredNode.children.filter(child => child.name !== 'DataObjectPackage');
      let childFound = this.fileService.getFileNodeById(filteredNode, node.id)
      return childFound ? true : false;
    }
    return true;
  }


  // Returns the positioning, in pixels, of a given node
  calculateNodePosition(node: FileNode): string {
    //Root node name
    if (node.name === this.rootElementName) {
      return new Number(28).toString();
    }
    //Root children with children
    if (node.children.length && node.name !== this.rootElementName) {
      return (new Number((this.findParentLevel(node) * 40) - 16)).toString();
    }
    //Root children without children-
    if ((!node.children.length && node.name !== this.rootElementName)) {
      return (new Number((this.findParentLevel(node) * 40) - 13)).toString();
    }
  }


  /** Error handler */
  handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status} Message: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }

  showAllowedChidren(node: FileNode) {
    if (this.childrenListToExclude) {
      return !this.childrenListToExclude.includes(node.name);
    }
  }

  addArchiveUnit(node: FileNode) {
    if (node.name == 'DescriptiveMetadata' || node.name == 'ArchiveUnit') {
      console.log("Clicked seda node : ", node.sedaData);
      this.insertItem(node, ['ArchiveUnit']);
      // Refresh the metadata tree and the metadatatable
      this.renderChanges(node);
      this.loggingService.showSuccess('La métadonnée ArchiveUnit a été ajoutée');
    }
  }

}
