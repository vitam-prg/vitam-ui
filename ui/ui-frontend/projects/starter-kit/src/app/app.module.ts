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
import { registerLocaleData } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { default as localeFr } from '@angular/common/locales/fr';
import { LOCALE_ID, NgModule } from '@angular/core';
import { MatCardModule, MatListModule, MatSidenavModule } from '@angular/material';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { QuicklinkModule } from 'ngx-quicklink';
import {
  BASE_URL,
  ENVIRONMENT,
  InjectorModule,
  LoggerModule,
  TranslateVitamModule,
  VitamUICommonModule,
  WINDOW_LOCATION } from 'ui-frontend-common';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ArraysModule } from './components/arrays/arrays.module';
import { BreadcrumbModule } from './components/breadcrumb/breadcrumb.module';
import { ButtonsModule } from './components/buttons/buttons.module';
import { InputsModule } from './components/inputs/inputs.module';
import { MiscellaneousModule } from './components/miscellaneous/miscellaneous.module';
import { ProgressBarModule } from './components/progress-bar/progress-bar.module';
import { TooltipModule } from './components/tooltip/tooltip.module';
import { StarterKitModule } from './starter-kit/starter-kit.module';
registerLocaleData(localeFr, 'fr');

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    InjectorModule,
    MatSnackBarModule,
    MatDialogModule,
    VitamUICommonModule,
    AppRoutingModule,
    StarterKitModule,
    LoggerModule.forRoot(),
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: TranslateVitamModule.httpLoaderChildFactory,
        deps: [HttpClient]
      },
      isolate: false,
    }),
    QuicklinkModule,
    ButtonsModule,
    MiscellaneousModule,
    ArraysModule,
    BreadcrumbModule,
    InputsModule,
    ProgressBarModule,
    TooltipModule,
    MatCardModule,
    MatSidenavModule,
    MatListModule,
  ],
  providers: [
    Title,
    { provide: LOCALE_ID, useValue: 'fr' },
    { provide: ENVIRONMENT, useValue: environment },
    { provide: BASE_URL, useValue: '/identity-api' },
    { provide: WINDOW_LOCATION, useValue: window.location }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }