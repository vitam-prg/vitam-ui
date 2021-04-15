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
import { MatTableDataSource } from '@angular/material/table';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ProfileService } from 'projects/pastis/src/app/core/services/profile.service';
import { ProfileDescription } from './models/profile-description.model';
import { Router } from '@angular/router';
import { FileService } from 'projects/pastis/src/app/core/services/file.service';
import { FileUploader } from 'ng2-file-upload';
import { MetadataHeaders } from 'projects/pastis/src/app/core/classes/models';
import { NoticeService } from 'projects/pastis/src/app/core/services/notice.service';

const URL = 'http://localhost:8080/rest/createprofilefromfile';

@Component({
  selector: 'pastis-list-profile',
  templateUrl: './list-profile.component.html',
  styleUrls: ['./list-profile.component.scss']
})
export class ListProfileComponent implements OnInit {

  @Input()
  uploader: FileUploader = new FileUploader({url: URL});
  
  fileToUpload: File = null;

  displayedColumns: string[] = ['type', "id","baseName","lastModified"]

  retrievedProfiles: ProfileDescription[] = [];

  matDataSource: MatTableDataSource<ProfileDescription>;

  numPA:number;

  numPUA:number;

  totalProfileNum:number;

  profileToLoad:any;

  hoveredElementId: number;

  buttonIsClicked: boolean;

  data = ["portail"]

  constructor(private profileService: ProfileService,private fileService: FileService, 
    private ngxLoader:NgxUiLoaderService, private router:Router, private noticeService : NoticeService) { }

  ngOnInit() {
    this.ngxLoader.startLoader('table-profiles'); // start non-master loader
    this.profileService.getAllProfiles().subscribe(profileList => {
      if (profileList) {
        profileList.forEach(p => this.retrievedProfiles.push(p));
        console.log ("Profiles: ", this.retrievedProfiles);
      }
      this.matDataSource = new MatTableDataSource<ProfileDescription>(this.retrievedProfiles);
      this.numPA = this.retrievePAorPUA("PA");
      this.numPUA = this.retrievePAorPUA("PUA");
      this.totalProfileNum = this.retrievedProfiles ? this.retrievedProfiles.length : 0;
    })
      this.ngxLoader.stopLoader('table-profiles');
  }

  retrievePAorPUA(term:string): number {
    let profileNum = this.retrievedProfiles.filter(p=>p.type === term).length
    return profileNum ? profileNum : 0;
  }

  editProfile(id:number) {
    this.router.navigate(['/edit/',id],{skipLocationChange: false});
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  uploadProfile(event: any) {
    const fileList: FileList = event.target.files;
    this.handleFileInput(fileList);
    if (this.fileToUpload) {
      const formData = new FormData();
      formData.append('file', this.fileToUpload, this.fileToUpload.name);
      this.profileService.uploadProfile(formData).subscribe( response => {
        if (response) {
          let notice = JSON.stringify(response);
          console.log('File submited! Reponse is : ', response);
          this.router.navigateByUrl('/new', { state: response });
          this.noticeService.notice.next(JSON.parse(JSON.parse(notice).notice));
          this.fileService.updateFileTree(response);
        }
      });
    }
  }

  isRowHovered(elementId: number) {
    return this.hoveredElementId === elementId;
  }

  onMouseOver(row: MetadataHeaders) {
    this.buttonIsClicked = false;
    this.hoveredElementId = row.id;
  }

  onMouseLeave() {
    if (!this.buttonIsClicked) {
      this.hoveredElementId = 0;
    }
  }

}
