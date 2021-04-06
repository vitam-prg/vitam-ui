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
import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../core/services/profile.service';
import { FileService } from '../../core/services/file.service';
import { FileNode } from '../../profile/edit-profile/classes/file-node';
import { NoticeService } from '../../core/services/notice.service';

@Component({
  selector: 'pastis-user-action-save-profile',
  templateUrl: './save-profile.component.html',
  styleUrls: ['./save-profile.component.scss']
})
export class UserActionSaveProfileComponent implements OnInit {

  data: FileNode[] = [];

  profileType:string;

  constructor(private profileService: ProfileService, private fileService: FileService, private noticeService: NoticeService) { }

  ngOnInit() {
    this.profileService.profileMode.subscribe(profileMode => {
      this.profileType = profileMode});
  }

    
  saveProfileToFile() {
    //Retrieve the current file tree data as a JSON
    this.data = this.fileService.allData.getValue();

    console.log("On export button saveProfileToFile with current data %o",this.fileService.nodeChange.getValue());
    if (this.data) {
      console.error("Profile type on: ", this.profileType )
      // Get Notice changement
      let notice:any;
      if(this.profileType === "PUA"){
        this.noticeService.notice.subscribe(
          (value: any) => {
            notice = value;
          },
          (error) => {
            console.log(error)
          }       
        )
      }
      
      // Send the retrieved JSON data to profile service
      this.profileService.uploadFile(this.data,notice,this.profileType).subscribe(retrievedData => {
        console.log("Data profile service: " + retrievedData)
        console.log('New updated data: ',  this.data);
        console.log('Data: ', retrievedData);
        this.downloadFile(retrievedData);
      });
    }
  }



  downloadFile(dataFile:any): void {
    console.error("Profile mode : ", this.profileType)
    let typeFile = this.profileType === "PA" ? 'application/xml' : 'application/json';
    const newBlob = new Blob([dataFile], { type: typeFile });
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(newBlob);
        return;
    }
    const data = window.URL.createObjectURL(newBlob);
    const link = document.createElement('a');
    link.href = data;
    link.download =  this.profileType === "PA" ? 'pastis_profile.rng' : 'pastis.json';
    // this is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    setTimeout( () => {
        // For Firefox it is necessary to delay revoking the ObjectURL
        window.URL.revokeObjectURL(data);
        link.remove();
    }, 100);
}

}
