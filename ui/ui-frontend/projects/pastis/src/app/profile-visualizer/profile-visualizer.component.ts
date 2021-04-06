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
import { Component, Input, OnInit } from '@angular/core';
import { SedaData } from '../profile/edit-profile/classes/seda-data';
import { PastisApiService } from '../core';
import { FileNode, TypeConstants } from '../profile/edit-profile/classes/file-node';
import { ProfileService } from '../core/services/profile.service';

let d3 = require('d3');
declare var classDiagram: any;
declare var multilineText: any;


@Component({
  selector: 'pastis-profile-visualizer',
  templateUrl: './profile-visualizer.component.html',
  styleUrls: ['./profile-visualizer.component.scss']
})
export class ProfileVisualizerComponent implements OnInit {

  sedaData:SedaData;
  profile:FileNode;
  @Input()
  profileId:number;

  private getSedaUrl = './assets/seda.json';
  classD:any
  multi:any;
  sedaClasses:any = []
  profileClasses:any = [];
  sedaConectors:any = []
  occurence:number[][] = []
  height:number;
  width:number
  boxes:any;
  
  constructor(private pastisService: PastisApiService,
    private profileService: ProfileService) {
    this.classD = classDiagram;
    this.multi = multilineText;
    this.height = window.innerHeight;
    this.width = window.innerWidth;
    
  }

  ngOnInit() {
      this.profileService.getProfile(this.profileId).subscribe((profile: any) =>{
        this.profile = profile[0];
        this.pastisService.getLocally(this.getSedaUrl).subscribe(sedaRules=> {
        this.sedaData = sedaRules[0]
        setTimeout(() => {
        if (this.sedaData) {
          this.occurence = []
          this.calculateOccurences(this.profile,1);
  
            this.boxes = this.classD.createClasses(this.profileClasses,svg);
            // Create a set to avoid duplicate classes         
            let uniqueProfiles = this.profileClasses.filter (function (value:any, index:any, array:any) { 
              return array.indexOf (value) == index;
            });          
            if (this.boxes && uniqueProfiles){
              this.generateClassesFromProfile(this.profile,1);
                this.generateConnectorsFromSeda(this.profile,uniqueProfiles,this.profile.id,svg,this.boxes);  
            }
          }
        }, 1000);
       })
    })
      var svg = d3.select('#profile-view')
                  .append("div")
                  // Container class to make it responsive.
                  .classed("svg-container", true) 
                  .append("svg")
                  // Responsive SVG needs these 2 attributes and no width and height attr.
                  .attr("preserveAspectRatio", "xMinYMin meet")
                  .attr("viewBox", "0 0 1300 3000")
                  // Class to make it responsive.
                  .classed("svg-content-responsive", true)
  
   
      this.classD.addMarkers(svg.append('defs'));
  
      svg.selectAll('text').attr('font-family', 'Noto Sans Japanese');
      
   
  }

  generateClassesFromProfile(data:FileNode,level:number):any{
    var root:any

    if (level === 1) {
      this.profileClasses.push({"x": 40 * level + 750, 
                                "y": 70 * level, 
                                "width":200, 
                                "classname": data.name,
                                "id": data.id,
                                "cardinality": data.cardinality,
                                "parentId":data.parentId,
                               })
    }
    root = this.profileClasses.find((e: { id: number; })=> e.id === data.id)

    for (let child of data.children) {
      if (child.type === "element" && child.sedaData.Element === "Complex" ) {
        // Find the children id

        let attributes:any = [];
        child.children.forEach(e => {
          if (e.type === 'attribute') {
            attributes.push('@' + e.name + ' [' + (e.cardinality ? e.cardinality : '1') + ']')
          }
          // All simple elements, with their attributes
          if (e.sedaData.Element === 'Simple') {
            attributes.push(e.name + ' (' + (e.cardinality ? e.cardinality : '1') + ')')
            //Check simple metadata documentation
            if (e.documentation) {attributes.push('[ ' + e.documentation + ' ]')}
            //Check all simple metadata children
            if (e.children.length){
              e.children.forEach(a=> {
                if (a.type === TypeConstants.attribute) {
                  attributes.push(e.name + ' / '+ '@' + a.name + '(' + (a.cardinality ? a.cardinality : '1') + ') ' + a.value + ' ' + a.documentation)
                }
              })
            }
          }
        })

        //Find elements of same level
        let elementsPerLevel = this.occurence.filter(e=> e[1] === child.level);
        let positionOfElementInLevel = elementsPerLevel.findIndex(e=>e[0] === child.id)
        this.profileClasses.push({"x": 50 + ((positionOfElementInLevel) * 250), 
                                  "y": 130 + root.y + 50 , 
                                  "width":200, 
                                  "classname": child.name,
                                  "parentId":child.parentId,
                                  "id": child.id,
                                  "cardinality": data.cardinality,
                                  "attributes": attributes} )                      
        if (child.children.length ){
          level = child.level + 1;
          this.generateClassesFromProfile(child, level) 
        }
      }
    }
  }

calculateOccurences(data:FileNode,level:number){
  for(let child of data.children) {
    if (child.type === "element" && child.sedaData.Element === "Complex") {
         this.occurence.push([child.id,child.level]);
    }
    if (child.children.length > 0){
      level = child.level + 1;
      this.calculateOccurences(child, level);
    }
  }
}

generateConnectorsFromSeda(profile:FileNode,generatedClases:any,parentId:any,svg:any,boxes:any){
  
  if (profile.children.length ) {
    for (let child of profile.children){
      if (child.type === 'element' && child.sedaData.Element === "Complex") {
        // Find a if a box corresponds to the a profile child
        var source:any = generatedClases.find((t: { id: number; }) => t.id === child.id)
        var target:any = generatedClases.find((t: { id: number; }) => t.id === parentId)
        let theTargetBox = boxes[parentId];
        if (source && target) {
          let randomXPos = Math.floor(Math.random() * target.width)  + target.x;
          let randomYPos = Math.floor(Math.random() * 40) + 5
          //Declare an array of points that will be used to create a line beetween the boxes
          this.sedaConectors.push({"points":[
            //1. Source point
            {"x":source.x + source.width / 2 , "y": source.y},
            // 2. Second point
            {"x":source.x + source.width / 2 , "y": source.y -randomYPos},
            // 3. Third point
            {"x":randomXPos , "y": source.y -randomYPos},
            //4. Target pont
            {"x": randomXPos, "y": target.classname === 'ArchiveTransfer' ? theTargetBox.bottomY() : theTargetBox.bottomY() -15 }
          ],markerEnd: 'diamond'})
        }
      }

      if (child.children.length > 0) {
        this.generateConnectorsFromSeda(child,generatedClases,child.id,svg,boxes);
      }
    }
  }
  this.classD.createConnectors(this.sedaConectors,svg);
  }

  
}
