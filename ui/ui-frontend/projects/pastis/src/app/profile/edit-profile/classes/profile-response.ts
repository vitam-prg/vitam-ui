

export interface ProfileResponse{
    id:number;
    profile: string;
    notice?:string;
}
export interface NoticeProfile{
  Description: string;
  _id: string;
  Name: string;
  Profile: string;
  Status: string;
  Identifier: string;
  CreationDate: string;
  LastUpdate: string;
  ActivationDate: string;
  DeactivationDate: string;
  ControlSchema: string;
  _tenant: string;
  _v: string;
  Fields: string [];
}
