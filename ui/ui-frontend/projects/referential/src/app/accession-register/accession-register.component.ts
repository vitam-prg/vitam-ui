// import {HttpHeaders,HttpParams} from '@angular/common/http';
import {HttpHeaders} from '@angular/common/http';
import {Component,OnInit} from '@angular/core';
import {AccessionRegisterSummary} from '../../../../vitamui-library/src/lib/models/accession-registe-summary';
import {AccessionRegisterStats} from '../../../../vitamui-library/src/lib/models/accession-registers-stats';
import {AccessionRegistersService} from './accession-register.service';
// import {AccessionRegistersService} from './accession-register.service';

@Component({
  selector: 'app-accession-register',
  templateUrl: './accession-register.component.html',
  styleUrls: ['./accession-register.component.scss']
})
export class AccessionRegisterComponent implements OnInit {

  accessionRegisterSummary: AccessionRegisterSummary[]=[];
  accessionRegisterStats: AccessionRegisterStats;

  constructor(private accessionRegisterService: AccessionRegistersService) {}

  ngOnInit(): void {
    console.log('this.accessionRegisterDetail',this.accessionRegisterService);
    this.accessionRegisterService.getStats(new HttpHeaders({'X-Access-Contract-Id': 'ContratTNR'})).subscribe((data) => {
      console.log('accessionRegisterStats',data);
      this.accessionRegisterStats=data;
    })
  }

  onSearchSubmit(search: string) {
    console.log('search',search);
  }
}
