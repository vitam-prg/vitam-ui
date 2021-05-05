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
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FileNode } from '../../profile/edit-profile/classes/file-node';
import { PastisApiService } from './api.pastis.service';
import { PastisConfiguration } from '../classes/pastis-configuration';
import { environment} from '../../../environments/environment'
import { cloneDeep } from 'lodash';
import { ProfileDescription } from 'projects/pastis/src/app/profile/list-profile/models/profile-description.model';
import { NoticeProfile, ProfileResponse } from 'projects/pastis/src/app/profile/edit-profile/classes/profile-response';
@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  
  private apiServerPath: string;
  public profileMode = new BehaviorSubject(null);

  constructor(private apiService: PastisApiService, private pastisConfig: PastisConfiguration) {
      this.apiServerPath = isDevMode() ? environment.apiServerUrl : pastisConfig.apiPastisUrl;
  }

  getAllProfiles():  Observable<ProfileDescription[]>{
    return this.apiService.get(this.apiServerPath + this.pastisConfig.getAllProfilesUrl);
  }

  getProfileOld(): Observable<FileNode[]> {
    return this.apiService.get<FileNode[]>(this.apiServerPath + this.pastisConfig.getProfileUrl);
  }

  getProfile(id:number): Observable<ProfileResponse> {
    let parameters = new HttpParams().set('id', id.toString());
    return this.apiService.post(this.pastisConfig.editProfileUrl,{},{params:parameters})
  }

  // Upload a RNG or a JSON file (PA or PUA, respectively) to the server
  // Response : a JSON object
  uploadProfile(profile: FormData): Observable<FileNode[]> {
    return this.apiService.post(this.pastisConfig.uploadProfileUrl, profile);
  }

  // Get the base rng profile
  getFile(): Observable<Blob> {
    const options = {responseType: 'blob'};
    return this.apiService.get(this.apiServerPath+this.pastisConfig.getFileUrl, options);
  }

  // Send the modified tree as post, 
  // Expects a RNG or a JSON file depending on the profile type 
  uploadFile(file: FileNode[],notice: NoticeProfile ,profileType:string): Observable<Blob> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json',
      }),
      responseType: 'blob'
    };
    let profile: any = cloneDeep(file[0]);
    
    let endPointUrl = profileType === "PA" ? this.pastisConfig.savePAasFileUrl : this.pastisConfig.savePUAasFileUrl
    this.fixCircularReference(profile);
    console.log("Data to")
    
    if(profileType === "PUA"){
      profile = {"elementProperties": profile, "notice": notice};
    }

    return this.apiService.post(endPointUrl, profile, httpOptions);
  }  

  fixCircularReference(node: FileNode){
    node.parent=null;
    node.sedaData=null;
    node.children.forEach(child=>{this.fixCircularReference(child);});
  }

  getProfileMode(){
    this.profileMode.getValue();
  }

  setProfileMode(profileType: string){
    this.profileMode.next(profileType)
  }
}
