import { Injectable } from "@angular/core";
import { PastisApiService } from '../services/api.pastis.service';
import { RegisterIconsService } from "../services/register-icons.service";
import { IconsEnum } from "./icons";

@Injectable()
export class PastisConfiguration {
    routeName : string;
    sucessMessage: string;
    errorMessage: string;
    apiRoutePath : string;
    apiPastisUrl: string;
    port: number;
    getProfileUrl: string;
    getAllProfilesUrl: string;
    editProfileUrl : string;
    uploadProfileUrl: string;
    savePAasFileUrl:string;
    savePUAasFileUrl:string;
    getFileUrl: string;
    updateFileUrl: string;
    apiFullPath: string;
  
  constructor(private pastisApi: PastisApiService,private iconsService:RegisterIconsService){};

public initConfiguration(): Promise<any> {
    return new Promise((r, e) => {  
        this.pastisApi.get("./assets/config/config.json").subscribe((content: PastisConfiguration) => {Object.assign(this, content);r(this);}, reason => e(reason));
    });
  };

  public registerIcons(): Promise<any> {
    return new Promise(() => {  
      this.iconsService.loadIcons(Object.values(IconsEnum), '../assets/svg/icons');
    });
  };

}
