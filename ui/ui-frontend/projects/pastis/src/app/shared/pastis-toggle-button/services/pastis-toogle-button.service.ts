import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PastisToogleButtonService {

  toggleButtonMode = new BehaviorSubject<boolean>(false);
  constructor() { }

  tooggleOn(){
    this.toggleButtonMode.next(true);
  }

  tooggleOff(){
    this.toggleButtonMode.next(false);
  }

}
