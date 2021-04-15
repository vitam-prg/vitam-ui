import { Injectable } from '@angular/core';
import { FileNode } from 'projects/pastis/src/app/profile/edit-profile/classes/file-node';

@Injectable({
  providedIn: 'root'
})
export class PuaService {

  constructor() { }

  puaToFileNode(profileResponse:any){
    let profile: any = JSON.parse(profileResponse.profile);
    if (profile.notice) {
      let puaProfile: FileNode  = JSON.parse(profile.notice.profile);
      return puaProfile;
    } else {
      return profile; 
    }

  }

  exportPUA(){
    
  }
}
