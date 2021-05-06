import {Component, OnDestroy, OnInit} from '@angular/core';
import {PastisNoticeToggleButtonService} from "./services/pastis-notice-toggle-button.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'pastis-notice-toggle-button',
  templateUrl: './pastis-notice-toggle-button.component.html',
  styleUrls: ['./pastis-notice-toggle-button.component.scss']
})
export class PastisNoticeToggleButtonComponent implements OnInit, OnDestroy {

  statusToggle: boolean;
  statusToggleSub: Subscription;

  constructor(private noticeToggleService: PastisNoticeToggleButtonService) { }

  ngOnInit(): void {
    this.statusToggleSub = this.noticeToggleService.toggleButtonMode.subscribe(
        (value: any) => {
          this.statusToggle = value;
        },
        (error) => {
          console.log(error);
        }
    );
  }
  changeStatus(): void {
    this.noticeToggleService.changeStatus(this.statusToggle);
  }

  ngOnDestroy(): void {
    this.statusToggleSub.unsubscribe();
  }
}
