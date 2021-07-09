// import {HttpHeaders,HttpParams} from '@angular/common/http';
import {Component,OnInit} from '@angular/core';
import {AccessionRegisterSummary} from '../../../../vitamui-library/src/lib/models/accession-registe-summary';
import {AccessionRegistersService} from './accession-register.service';
// import {AccessionRegistersService} from './accession-register.service';

@Component({
  selector: 'app-accession-register',
  templateUrl: './accession-register.component.html',
  styleUrls: ['./accession-register.component.scss']
})
export class AccessionRegisterComponent implements OnInit {

  accessionRegisterSummary: AccessionRegisterSummary[]=[];

  constructor(private accessionRegisterService: AccessionRegistersService) {}

  ngOnInit(): void {
    console.log('this.accessionRegisterDetail',this.accessionRegisterService);
  }

  onSearchSubmit(search: string) {
    console.log('search',search);
  }
}
