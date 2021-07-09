/*
 * Copyright French Prime minister Office/SGMAP/DINSIC/Vitam Program (2019-2020)
 * and the signatories of the "VITAM - Accord du Contributeur" agreement.
 *
 * contact@programmevitam.fr
 *
 * This software is a computer program whose purpose is to implement
 * implement a digital archiving front-office system for the secure and
 * efficient high volumetry VITAM solution.
 *
 * This software is governed by the CeCILL-C license under French law and
 * abiding by the rules of distribution of free software.  You can  use,
 * modify and/ or redistribute the software under the terms of the CeCILL-C
 * license as circulated by CEA, CNRS and INRIA at the following URL
 * "http://www.cecill.info".
 *
 * As a counterpart to the access to the source code and  rights to copy,
 * modify and redistribute granted by the license, users are provided only
 * with a limited warranty  and the software's author,  the holder of the
 * economic rights,  and the successive licensors  have only  limited
 * liability.
 *
 * In this respect, the user's attention is drawn to the risks associated
 * with loading,  using,  modifying and/or developing or reproducing the
 * software by the user in light of its specific status of free software,
 * that may mean  that it is complicated to manipulate,  and  that  also
 * therefore means  that it is reserved for developers  and  experienced
 * professionals having in-depth computer knowledge. Users are therefore
 * encouraged to load and test the software's suitability as regards their
 * requirements in conditions enabling the security of their systems and/or
 * data to be ensured and,  more generally, to use and operate it in the
 * same conditions as regards security.
 *
 * The fact that you are presently reading this means that you have had
 * knowledge of the CeCILL-C license and that you accept its terms.
 */
import {HttpHeaders} from '@angular/common/http';
import {Component,OnDestroy,OnInit} from '@angular/core';
import {merge,Subject} from 'rxjs';
import {debounceTime,startWith} from 'rxjs/operators';
import {Colors,DEFAULT_PAGE_SIZE,Direction,InfiniteScrollTable,Logger,PageRequest} from 'ui-frontend-common';
import {FacetDetails} from 'ui-frontend-common/app/modules/models/operation/facet-details.interface';
import {AccessionRegisterDetail} from '../../../../../vitamui-library/src/lib/models/accession-registers-detail';
import {AccessionRegisterStats} from '../../../../../vitamui-library/src/lib/models/accession-registers-stats';
import {AccessionRegistersService} from '../accession-register.service';

const FILTER_DEBOUNCE_TIME_MS=400;

@Component({
  selector: 'app-accession-register-list',
  templateUrl: './accession-register-list.component.html',
  styleUrls: ['./accession-register-list.component.scss']
})
export class AccessionRegisterListComponent extends InfiniteScrollTable<AccessionRegisterDetail> implements OnDestroy,OnInit {

  /*@Input('search')
  set searchText(searchText: string) {
    this._searchText=searchText;
    this.searchChange.next(searchText);
  }*/
  // private _searchText: string;

  orderBy='name';
  direction=Direction.ASCENDANT;

  private readonly filterChange=new Subject<{[key: string]: any[]}>();
  private readonly searchChange=new Subject<string>();
  private readonly orderChange=new Subject<string>();


  accessionRegisterStats: AccessionRegisterStats;

  statusFacetDetails: FacetDetails[]=[];
  stateFacetDetails: FacetDetails[]=[];
  stateFacetTitle: string;
  statusFacetTitle: string;
  // CheckBox on first td
  checked=false;
  indeterminate=false;
  labelPosition: 'before'|'after'='after';
  disabled=false;
  constructor(public accessionRegistersService: AccessionRegistersService,public logger: Logger) {
    super(accessionRegistersService);
  }

  ngOnInit() {

    this.accessionRegistersService.getStats(new HttpHeaders({'X-Access-Contract-Id': 'ContratTNR'})).subscribe((data) => {
      console.log('accessionRegisterStats',data);
      this.accessionRegisterStats=data;
      this.initializeFacet();
    });

    const searchCriteriaChange=merge(this.searchChange,this.filterChange,this.orderChange)
      .pipe(
        startWith(null),
        debounceTime(FILTER_DEBOUNCE_TIME_MS)
      );

    searchCriteriaChange.subscribe(() => this.search());
  }



  initializeFacet() {
    //this.stateFacetTitle='titre de la facette';
    //this.statusFacetTitle='statistiques des registres de fonds';

    this.initializeFacetDetails();

    this.stateFacetDetails.push({
      title: 'Toutes les opérations d\'entrées',
      totalResults: this.accessionRegisterStats.totalUnits,
      clickable: false,
      color: Colors.DEFAULT,
      filter: 'RUNNING',
    });
    this.stateFacetDetails.push({
      title: 'Toutes les unités archivistiques',
      totalResults: this.accessionRegisterStats.totalUnits,
      clickable: false,
      color: Colors.DEFAULT,
      filter: 'RUNNING',
    });
    this.stateFacetDetails.push({
      title: 'Tout les groupes d\'objets',
      totalResults: this.accessionRegisterStats.totalObjectsGroups,
      clickable: false,
      color: Colors.DEFAULT,
      filter: 'PAUSE',
    });
    this.stateFacetDetails.push({
      title: 'Tout les objets',
      totalResults: this.accessionRegisterStats.totalObjects,
      clickable: false,
      color: Colors.DEFAULT,
      filter: 'COMPLETED',
    });
    this.stateFacetDetails.push({
      title: 'Volumétrie totale',
      totalResults: this.accessionRegisterStats.objectSizes,
      clickable: false,
      color: Colors.DEFAULT,
      filter: 'COMPLETED',
    });
  }

  private initializeFacetDetails() {
    this.stateFacetDetails=[];
    this.statusFacetDetails=[];
  }

  ngOnDestroy() {
  }

  search() {
    const pageRequest=new PageRequest(0,DEFAULT_PAGE_SIZE,'OriginatingAgency',this.direction);

    super.search(pageRequest);
  }

}
