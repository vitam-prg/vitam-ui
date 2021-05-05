import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { PastisToogleButtonService } from './services/pastis-toogle-button.service';

@Component({
  selector: 'pastis-toggle-button',
  templateUrl: './pastis-toggle-button.component.html',
  styleUrls: ['./pastis-toggle-button.component.scss']
})
export class PastisToggleButtonComponent implements OnInit {

  @Input() nameOn:string;
  @Input() nameOff:string;
  @Output() callBackFunction: EventEmitter<any> = new EventEmitter();

  status:boolean
  profileType:string;
  constructor(private toogleService : PastisToogleButtonService) { }

  ngOnInit() {
    this.toogleService.toggleButtonMode.subscribe(mode=>{
        this.status = mode;  
    })
  }

  checkToggle(event: any) {
    event.target.checked ? this.toogleService.tooggleOn() : this.toogleService.tooggleOff();
    this.callBackFunction.emit();
  }




}
