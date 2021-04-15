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
import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { ToggleSidenavService } from '../../core/services/toggle-sidenav.service';
import { FileService } from '../../core/services/file.service';
import { SedaService } from '../../core/services/seda.service';

import { FileNode } from './classes/file-node';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { BehaviorSubject} from 'rxjs';
import { FileTreeComponent } from './file-tree/file-tree.component';
import { SedaData } from './classes/seda-data';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ProfileService } from 'projects/pastis/src/app/core/services/profile.service';
import { Router } from '@angular/router';
import { ProfileDescription } from '../list-profile/models/profile-description.model';

export interface UploadedProfileResponse {
  profile: FileNode[];
  id: number;
}
@Component({
  selector: 'pastis-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})

export class EditProfileComponent implements OnInit, OnDestroy {

  @Input()
  profileId: number;

  profileList: ProfileDescription[];

  profileType: string;

  nodeToSend: FileNode;

  sedaParentNode: SedaData;

  profileRulesIsLoaded: boolean;

  loadRules: boolean;

  activeTabIndex: number;

  sideNavOpened: boolean;

  tabRootElementName: string;

  puaMode: boolean;

  tabRulesMap: Map<string, Map<string, string[]>>;
  nodeParentChildMap: Map<string, string[]>;

  nestedTreeControl: NestedTreeControl<FileNode>;
  nestedDataSource: MatTreeNestedDataSource<FileNode>;

  dataChange = new BehaviorSubject<FileNode[]>([]);

  profileTabChildrenToInclude: string[] = [];
  profileTabChildrenToExclude: string[] = [];
  headerTabChildrenToInclude: string[] = [];
  headerTabChildrenToExclude: string[] = [];
  rulesTabChildrenToInclude: string[] = [];
  rulesTabChildrenToExclude: string[] = [];
  treeTabChildrenToInclude: string[] = [];
  treeTabChildrenToExclude: string[] = [];
  objectTabChildrenToInclude: string[] = [];
  objectTabChildrenToExclude: string[] = [];

  rootNames: string[] = [];
  displayedRootNames: string[] = [];
  tabLabels: string[] = [];
  collectionNames: string[] = [];
  tabShowElementRules: string[][][] = [];

  collectionName: string;
  rootTabMetadataName: string;
  elementRules: string[][] = [];

  profile: FileNode[];

  @ViewChild(FileTreeComponent, { static: false }) fileTreeComponent: FileTreeComponent;
  noticeSelected: boolean;


  constructor(private sedaService: SedaService, private fileService: FileService, private router: Router,
              private sideNavService: ToggleSidenavService, private profileService: ProfileService,
              private loaderService: NgxUiLoaderService) {


    let uploadedProfileResponse = this.router.getCurrentNavigation().extras.state;

    // Get profile type if profile is user uploads a file
    if (uploadedProfileResponse) {
      this.profile = JSON.parse(uploadedProfileResponse.profile);
      this.profileType =  this.profile[0].name === "ArchiveTransfer" ? "PA" : "PUA";
      this.profileService.setProfileMode(this.profileType);
      this.initActiveTabAndProfileMode();
      console.log(this.puaMode)
    } else {
      // Get profile type if profile is selected from the list of profiles
      this.profileService.getAllProfiles().subscribe(profiles => {
        this.profileType = profiles.find(p => p.id.toString() === this.profileId.toString()).type;
        this.profileService.setProfileMode(this.profileType);
        this.initActiveTabAndProfileMode();
        console.warn(this.puaMode)
      })
    }


    //Set tab and metadata rules according to profile type
    //this.setTabsAndMetadataRules(this.activeTabIndex);
    //Init rules according to profile type
    this.collectionName = this.profileType === "PA" ? this.collectionNames[this.activeTabIndex] : this.collectionNames[3];
    this.rootTabMetadataName = this.profileType === "PA" ? this.rootNames[this.activeTabIndex] : this.rootNames[3];
    this.elementRules = this.profileType === "PA" ? this.tabShowElementRules[this.activeTabIndex] : this.tabShowElementRules[3];

    this.nestedTreeControl = new NestedTreeControl<FileNode>(this.getChildren);
    this.nestedDataSource = new MatTreeNestedDataSource();

    this.tabLabels.push('PROFIL', 'ENTÊTE', 'RÈGLES', 'ARBORESCENCE', 'OBJETS', 'NOTICE');
    this.collectionNames = this.tabLabels.map(name => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase());
    this.rootNames.push('', 'ArchiveTransfer', 'ManagementMetadata', 'DescriptiveMetadata', 'DataObjectPackage');
    this.displayedRootNames.push('', 'Entête', 'Règles', 'Unités d\'archives', 'Objets');

    // Children to include or exclude
    this.profileTabChildrenToInclude.push();
    this.profileTabChildrenToExclude.push();
    this.headerTabChildrenToInclude.push();
    this.headerTabChildrenToExclude.push('DataObjectPackage', 'DataObjectGroup', 'DescriptiveMetadata', 'ManagementMetadata', 'id', 'BinaryDataObject');
    this.rulesTabChildrenToInclude.push();
    this.rulesTabChildrenToExclude.push();
    this.treeTabChildrenToInclude.push();
    this.treeTabChildrenToExclude.push();
    this.objectTabChildrenToInclude.push('BinaryDataObject', 'PhysicalDataObject')
    this.objectTabChildrenToExclude.push('ManagementMetadata', 'ArchiveUnit', 'DescriptiveMetadata');
    this.tabShowElementRules.push(
        [this.profileTabChildrenToInclude, this.profileTabChildrenToExclude],
        [this.headerTabChildrenToInclude, this.headerTabChildrenToExclude],
        [this.rulesTabChildrenToInclude, this.rulesTabChildrenToExclude],
        [this.treeTabChildrenToInclude, this.treeTabChildrenToExclude],
        [this.objectTabChildrenToInclude, this.objectTabChildrenToExclude])
  }
  ngOnInit() {
    this.fileService.reinitialisaDataChange();
    this.setTabsAndMetadataRules(this.activeTabIndex);
    //Set initial rules
    this.fileService.setCollectionName(this.collectionName);
    this.fileService.setTabRootMetadataName(this.rootTabMetadataName);
    this.fileService.setNewChildrenRules(this.elementRules);

    //Adding seda metadata to node
    if (this.profileId > 0) {
      this.fileService.addSedaMetadataToFileTree(this.profileId).subscribe(response => {
        this.nodeToSend = response[0];
        if (this.nodeToSend) {
          this.fileService.allData.next(response);
          let filteredData = this.getFilteredData(this.rootTabMetadataName);
          this.nestedDataSource.data = filteredData;
          this.nestedTreeControl.dataNodes = filteredData;
          this.nestedTreeControl.expand(filteredData[0]);
          this.dataChange.next(filteredData);
          this.fileService.filteredNode.next(filteredData[0]);
        }
        console.log("Init file tree node on file tree : %o", this.dataChange.getValue());
      });
    } else {
      this.fileService.addSedaMetadataFromFileToFileTree(this.profile).subscribe(response => {
        this.nodeToSend = response[0];
        if (this.nodeToSend) {
          this.fileService.allData.next(response);
          let fiteredData = this.getFilteredData(this.rootTabMetadataName);
          this.nestedDataSource.data = fiteredData;
          this.nestedTreeControl.dataNodes = fiteredData;
          this.nestedTreeControl.expand(fiteredData[0]);
          this.dataChange.next(fiteredData);
          this.fileService.filteredNode.next(fiteredData[0]);
        }
      });
    }
    this.sedaService.getSedaRules().subscribe((data: any) => {
      this.sedaParentNode = data[0];
    })
  }

  updateFileTree(response: FileNode[]){
    this.fileService.allData.next(response);
    let fiteredData = this.getFilteredData(this.rootTabMetadataName);
    this.nestedDataSource.data = fiteredData;
    this.nestedTreeControl.dataNodes = fiteredData;
    this.nestedTreeControl.expand(fiteredData[0]);
    this.dataChange.next(fiteredData);
    this.fileService.filteredNode.next(fiteredData[0]);
  }

  isTabClicked(i: number): boolean {
    return i === this.activeTabIndex;
  }

  initActiveTabAndProfileMode() {
    this.profileType === "PA" ? this.activeTabIndex = 1 : this.activeTabIndex = 3;
    this.profileType === "PUA" ? this.puaMode = true : this.puaMode = false;
    this.profileService.setProfileMode(this.profileType);
  }

  loadProfile(event: MatTabChangeEvent) {

    // If you want to see notice don't need to load profile
    if(this.puaMode && event.index == 0){
      this.noticeSelected = true;
      this.sideNavService.statusNotice(this.noticeSelected);
    }else{
      this.setTabsAndMetadataRules(event.index);
      this.loadProfileData();
      this.noticeSelected = false;
      this.sideNavService.statusNotice(this.noticeSelected);
    }
  }

  setTabsAndMetadataRules(tabIndex: number) {
    this.activeTabIndex = tabIndex;
    this.collectionName = this.profileType === "PA" ? this.collectionNames[this.activeTabIndex] : this.collectionNames[3];
    this.rootTabMetadataName = this.profileType === "PA" ? this.rootNames[this.activeTabIndex] : this.rootNames[3];
    this.elementRules = this.profileType === "PA" ? this.tabShowElementRules[this.activeTabIndex] : this.tabShowElementRules[3];
  }

  loadProfileData() {
    this.fileService.setCollectionName(this.collectionName)
    this.fileService.setTabRootMetadataName(this.rootTabMetadataName);
    this.fileService.setNewChildrenRules(this.elementRules);

    let fiteredData = this.getFilteredData(this.rootTabMetadataName);
    if (fiteredData) {
      this.loaderService.start();
      this.fileService.nodeChange.next(fiteredData[0]);
      this.nestedDataSource.data = fiteredData;
      this.nestedTreeControl.dataNodes = fiteredData;
      this.nestedTreeControl.expand(fiteredData[0]);
      console.log("Root seda is ", this.sedaService.selectedSedaNodeParent.getValue());
      this.fileTreeComponent.sendNodeMetadata(fiteredData[0]);
    }
    this.loaderService.stop();

  }

  getFilteredData(rootTreeMetadataName: string): FileNode[] {
    if (this.nodeToSend) {
      let nodeNameToFilter = this.profileType === "PA" ? rootTreeMetadataName : this.nodeToSend.name;
      let currentNode = this.fileService.getFileNodeByName(this.fileService.allData.getValue()[0], nodeNameToFilter);
      let filteredData = [];
      filteredData.push(currentNode);
      console.log("Filtered data : ", filteredData)
      return filteredData;
    }
  }

  getChildren = (node: FileNode) => node.children;


  closeSideNav() {
    this.sideNavService.hide()
  }

  canShowOnPuaMode(tabIndex: number) {
    return this.puaMode ? (tabIndex === 0 || tabIndex === 3 || tabIndex === 5) : true;
  }

  ngOnDestroy() {
  }

}
