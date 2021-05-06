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

import {Component, OnDestroy, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {Subscription} from 'rxjs';
import {ToggleSidenavService} from '../core/services/toggle-sidenav.service';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {NoticeProfile} from "../profile/edit-profile/classes/profile-response";
import {NoticeService} from '../core/services/notice.service'
@Component({
  selector: 'pastis-notice',
  templateUrl: './notice.component.html',
  styleUrls: ['./notice.component.scss']
})
export class NoticeComponent implements OnInit, OnDestroy {

  tabLabels: string[] = [];
  keys: string[] = [];
  notice: NoticeProfile;
  noticeSub: Subscription;
  opened: boolean;
  openedSub: Subscription;
  events: string[] = [];
  newComponent: boolean;
  options: FormGroup;
  hideRequiredControl = new FormControl(false);
  floatLabelControl = new FormControl('auto');

  constructor(private route: ActivatedRoute, private sideNavService: ToggleSidenavService, private fb: FormBuilder,
              private router: Router, private noticeService: NoticeService) {
    this.options = this.fb.group({
      hideRequired: this.hideRequiredControl,
      floatLabel: this.floatLabelControl,
    });
    this.newComponent = (this.route.snapshot.url[0].path === "new");
     if(this.newComponent){
       this.noticeSub = this.noticeService.notice.subscribe(
         (value: any) => {
           console.log(value)
           this.notice = value;
         },
         (error) => {
           console.log(error)
         }
       );
     }else{
       this.noticeSub = this.noticeService.getNotice().subscribe(
         (value: any) => {
           this.notice = value;
         },
         (error) => {
           console.log(error)
         }
       );
     }
  }
  ngOnInit() {
    this.openedSub = this.sideNavService.isOpened.subscribe((status) => {
          this.opened = status;
        },
        (error) => {
          console.log(error);
        });
    this.keys.push('Profile d\'unité archivistique', 'Nom du PUA');
    this.tabLabels.push('NOTICE', 'UNITÉ D\'ARCHIVES');

  }
  goBack(){
    this.router.navigate(['/'],{skipLocationChange: false});
  }

  changeNotice(){
    this.noticeService.notice.next(this.notice);
  }

  ngOnDestroy(): void {
    this.openedSub.unsubscribe();
    this.noticeSub.unsubscribe();
  }


}
