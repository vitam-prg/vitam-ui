import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpRequest,
  HttpHandler,
  HttpInterceptor,
  HttpErrorResponse,
  HttpResponse
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { finalize,  catchError, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../../core/services/notification.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { FileService } from 'projects/pastis/src/app/core/services/file.service';
import { SedaService } from 'projects/pastis/src/app/core/services/seda.service';

@Injectable({
  providedIn: 'root'
})
export class PastisSpinnerInterceptor implements HttpInterceptor {
  
  count = 0;
  isSedaLoaded:boolean;

  constructor(public ngxService:NgxUiLoaderService,
    public notificationService: NotificationService,
    public toasterService: ToastrService) { }

  intercept(req: HttpRequest<FileService | SedaService>, next: HttpHandler): Observable<HttpEvent<any>> {

    setTimeout(() => {
      if (this.count < 0) return next.handle(req);
      this.ngxService.start(); 
      this.count++; 
    }, 10);


    return next.handle(req).pipe(
      tap(evt => {
        if (evt instanceof HttpResponse && new RegExp('createprofile').test(req.url)) {
          if (evt.body) {
            console.log('Inside loaderInterceptor on url : ', req.url );
            this.notificationService.showSuccess('Les données RNG ont été chargées avec succès' );
          }
        }
        if (evt instanceof HttpResponse && new RegExp('edit').test(req.url)) {
          if (evt.body) {
            console.log('Inside loaderInterceptor on url : ', req.url );
            this.notificationService.showSuccess('Les données RNG ont été chargées avec succès' );
          }
        }
        if (evt instanceof HttpResponse && new RegExp('seda').test(req.url)) {
          if (evt.body && !this.isSedaLoaded) {
            console.log('Inside loaderInterceptor on url : ', req.url );
            this.notificationService.showSuccess('Les données SEDA ont été chargées avec succès');
            this.isSedaLoaded = true;
          }
        }
        if (evt instanceof HttpResponse && new RegExp('updateprofile').test(req.url)) {
          if (evt.body) {
            console.log('Inside loaderInterceptor on url : ', req.url );
            this.notificationService.showSuccess('Le fichier RNG a été généré avec succès');
          }
        }      
      }),
      finalize(() => {
        this.count --;
        if (this.count === 0 ) this.ngxService.stop();
      }),
      catchError((error: any) => {
        if (error instanceof HttpErrorResponse) {
          try {
            this.handleError(error);
          } catch (error) {
            this.handleError(error);
          }
          //log error 
        }
        return of(error);
      }));
      
  }


  handleError(error: HttpErrorResponse) {
    if (new RegExp('createprofile').test(error.url)) this.notificationService.showError('Échec lors du chargement du fichier RNG');
    if (new RegExp('seda').test(error.url)) this.notificationService.showError('Échec lors du chargement des données SEDA');
    if (new RegExp('updateprofile').test(error.url)) this.notificationService.showError('Échec lors de la géneration du fichier RNG');
  }

}
