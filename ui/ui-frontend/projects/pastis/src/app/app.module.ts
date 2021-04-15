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

// Angular modules
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, APP_INITIALIZER, LOCALE_ID} from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { PortalModule  } from '@angular/cdk/portal';

//Pastis modules
import { CoreModule } from './core/core.module';
import { FileTreeModule } from './profile/edit-profile/file-tree/file-tree.module';
import { UserActionsModule } from './user-actions/user-actions.module';
import { SharedModule } from './shared/shared.module';
import { ProfileModule} from './profile/profile.module'


//Routing Modules and components
import { AppRoutingModule,routingComponents } from './app-routing.module';


// Components and services
import { AppComponent } from './app.component';
import { PastisDialogConfirmComponent } from './shared/pastis-dialog/pastis-dialog-confirm/pastis-dialog-confirm.component';
import { UserActionAddMetadataComponent } from './user-actions/add-metadata/add-metadata.component';
import { UserActionRemoveMetadataComponent } from './user-actions/remove-metadata/remove-metadata.component';
import { ToastContainerModule, ToastrModule } from 'ngx-toastr';
import { PastisConfiguration } from '../app/core/classes/pastis-configuration';
import { QuicklinkModule } from 'ngx-quicklink';
import { RegisterIconsService } from './core/services/register-icons.service';
import { BASE_URL, ENVIRONMENT, LoggerModule, VitamUICommonModule, WINDOW_LOCATION } from 'ui-frontend-common';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import {environment} from 'projects/pastis/src/environments/environment';
import { ServiceWorkerModule } from '@angular/service-worker';



export function httpLoaderFactory(httpClient: HttpClient): MultiTranslateHttpLoader {
  return new MultiTranslateHttpLoader(httpClient,  [
  {prefix: './assets/shared-i18n/', suffix: '.json'},
  {prefix: './assets/i18n/', suffix: '.json'}
]);
}

@NgModule({
  declarations: [
    AppComponent,
    UserActionAddMetadataComponent,
    UserActionRemoveMetadataComponent,
    routingComponents,
  ],
  entryComponents:[PastisDialogConfirmComponent,UserActionAddMetadataComponent,UserActionRemoveMetadataComponent],
  imports: [
    HttpClientModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    PortalModule,
    UserActionsModule,
    CoreModule,
    FileTreeModule,
    SharedModule,
    AppRoutingModule,
    ProfileModule,
    ToastContainerModule,
    QuicklinkModule,
    VitamUICommonModule,
    LoggerModule.forRoot(),
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-full-width',
      preventDuplicates: false,
      timeOut: 2000,
      closeButton:false,
      easeTime:0
    }),
    TranslateModule.forRoot({
      defaultLanguage: 'fr',
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
  ],
  exports:[
      HttpClientModule,
      BrowserModule,
      FormsModule,
      ReactiveFormsModule,
      BrowserAnimationsModule,
      UserActionsModule,
      CoreModule,
      FileTreeModule,
      SharedModule,
      VitamUICommonModule
  ],
  providers: [
    Title,
    { provide: BASE_URL, useValue: '/portal-api' },
    { provide: ENVIRONMENT, useValue: environment },
    { provide: LOCALE_ID, useValue: 'fr'},
    { provide: WINDOW_LOCATION, useValue: window.location},
    PastisConfiguration,
    {
        provide: APP_INITIALIZER,
        useFactory: PastisConfigurationFactory,
        deps: [PastisConfiguration, HttpClient], multi: true },
  ],

  bootstrap: [AppComponent],
 
})
export class AppModule { }

  export function PastisConfigurationFactory(appConfig: PastisConfiguration) {
    return () => appConfig.initConfiguration();
  }
  export function PastisIconsFactory(registerIcon: RegisterIconsService) {
    return () => registerIcon.registerIcons();
  }
  
